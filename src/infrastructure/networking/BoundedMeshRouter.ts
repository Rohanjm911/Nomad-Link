

import { MessageEnvelope, PriorityLevel } from '../../../protocol/WireProtocol';
import { DeliveryState, MessageModel } from '../../domain/models/DomainModels';

export interface RouteForwardingResult {
  forwardedCount: number;
  droppedCount: number;
  deliveredLocally: MessageEnvelope[];
}

export class BoundedMeshRouter {
  private readonly myPeerId: string;
  private readonly maxQueueCapacity: number;
  private readonly maxHops: number;

  
  private seenMessageIds: Set<string> = new Set();
  
  
  private forwardQueue: Map<string, MessageEnvelope> = new Map();

  
  private transportDispatcher?: (envelope: MessageEnvelope, targetPeerId: string) => Promise<boolean>;

  constructor(myPeerId: string, maxQueueCapacity: number = 200, maxHops: number = 7) {
    this.myPeerId = myPeerId;
    this.maxQueueCapacity = maxQueueCapacity;
    this.maxHops = maxHops;
  }

  public setTransportDispatcher(
    dispatcher: (envelope: MessageEnvelope, targetPeerId: string) => Promise<boolean>
  ) {
    this.transportDispatcher = dispatcher;
  }

  
  public receiveEnvelope(envelope: MessageEnvelope): {
    accepted: boolean;
    isForMe: boolean;
    reason?: string;
  } {
    const now = Date.now();

    
    if (this.seenMessageIds.has(envelope.messageId)) {
      return { accepted: false, isForMe: false, reason: 'Duplicate message ID already processed' };
    }

    
    if (envelope.expiresAt <= now) {
      return { accepted: false, isForMe: false, reason: 'Message envelope expired' };
    }

    
    if (envelope.hopCount >= this.maxHops || envelope.hopLimit <= 0) {
      return { accepted: false, isForMe: false, reason: 'Hop limit exceeded' };
    }

    
    this.seenMessageIds.add(envelope.messageId);

    
    if (this.seenMessageIds.size > 2000) {
      const iter = this.seenMessageIds.values();
      for (let i = 0; i < 500; i++) {
        this.seenMessageIds.delete(iter.next().value!);
      }
    }

    
    const isForMe = envelope.destinationId === this.myPeerId || envelope.destinationId === '*';

    
    if (envelope.destinationId !== this.myPeerId) {
      this.enqueueForForwarding({
        ...envelope,
        hopCount: envelope.hopCount + 1,
        hopLimit: envelope.hopLimit - 1,
      });
    }

    return { accepted: true, isForMe };
  }

  
  public enqueueForForwarding(envelope: MessageEnvelope): void {
    
    if (this.forwardQueue.size >= this.maxQueueCapacity) {
      this.evictLowestPriorityItem();
    }

    this.forwardQueue.set(envelope.messageId, envelope);
  }

  
  public async flushQueueForReachablePeer(peerId: string): Promise<number> {
    if (!this.transportDispatcher) return 0;

    let forwarded = 0;
    const now = Date.now();
    const toDelete: string[] = [];

    
    const sortedEnvelopes = Array.from(this.forwardQueue.values()).sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.createdAt - b.createdAt;
    });

    for (const env of sortedEnvelopes) {
      if (env.expiresAt <= now) {
        toDelete.push(env.messageId);
        continue;
      }

      
      if (env.originPeerId === peerId) {
        continue;
      }

      
      const isDestination = env.destinationId === peerId || env.destinationId === '*';
      const isRelayCandidate = env.hopLimit > 0;

      if (isDestination || isRelayCandidate) {
        try {
          const success = await this.transportDispatcher(env, peerId);
          if (success) {
            forwarded++;
            if (env.destinationId === peerId) {
              
              toDelete.push(env.messageId);
            }
          }
        } catch {
          
        }
      }
    }

    
    for (const id of toDelete) {
      this.forwardQueue.delete(id);
    }

    return forwarded;
  }

  
  private evictLowestPriorityItem(): void {
    let oldestKey: string | null = null;
    let lowestPriority = PriorityLevel.PRIORITY_EMERGENCY + 1;
    let oldestTime = Infinity;

    for (const [id, env] of this.forwardQueue.entries()) {
      if (env.priority < lowestPriority) {
        lowestPriority = env.priority;
        oldestTime = env.createdAt;
        oldestKey = id;
      } else if (env.priority === lowestPriority && env.createdAt < oldestTime) {
        oldestTime = env.createdAt;
        oldestKey = id;
      }
    }

    if (oldestKey) {
      this.forwardQueue.delete(oldestKey);
    }
  }

  public getQueueLength(): number {
    return this.forwardQueue.size;
  }

  public getSeenIdsCount(): number {
    return this.seenMessageIds.size;
  }
}
