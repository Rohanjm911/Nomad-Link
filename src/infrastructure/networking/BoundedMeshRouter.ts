/**
 * NOMAD LINK - Bounded Delay-Tolerant Network (DTN) Mesh Router
 * Implements store-and-forward routing, epidemic controlled gossip forwarding,
 * message deduplication, TTL/hop-count bounds, and per-peer forwarding queues.
 */

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

  // Persistent deduplication set of message IDs already received/relayed
  private seenMessageIds: Set<string> = new Set();
  
  // Store-and-Forward Bounded Queue (sorted by priority & creation time)
  private forwardQueue: Map<string, MessageEnvelope> = new Map();

  // Callback to dispatch envelope through native transport (BLE or Wi-Fi Direct)
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

  /**
   * Processes an incoming envelope received over radio (BLE or Wi-Fi Direct)
   */
  public receiveEnvelope(envelope: MessageEnvelope): {
    accepted: boolean;
    isForMe: boolean;
    reason?: string;
  } {
    const now = Date.now();

    // 1. Deduplication Check
    if (this.seenMessageIds.has(envelope.messageId)) {
      return { accepted: false, isForMe: false, reason: 'Duplicate message ID already processed' };
    }

    // 2. Expiry / TTL Check
    if (envelope.expiresAt <= now) {
      return { accepted: false, isForMe: false, reason: 'Message envelope expired' };
    }

    // 3. Hop Limit Check
    if (envelope.hopCount >= this.maxHops || envelope.hopLimit <= 0) {
      return { accepted: false, isForMe: false, reason: 'Hop limit exceeded' };
    }

    // Mark as seen to prevent forwarding loops
    this.seenMessageIds.add(envelope.messageId);

    // Prune seen set if memory exceeds bound
    if (this.seenMessageIds.size > 2000) {
      const iter = this.seenMessageIds.values();
      for (let i = 0; i < 500; i++) {
        this.seenMessageIds.delete(iter.next().value!);
      }
    }

    // 4. Check if message is addressed to me or broadcast
    const isForMe = envelope.destinationId === this.myPeerId || envelope.destinationId === '*';

    // 5. If not exclusively for me (or broadcast), store into forward queue
    if (envelope.destinationId !== this.myPeerId) {
      this.enqueueForForwarding({
        ...envelope,
        hopCount: envelope.hopCount + 1,
        hopLimit: envelope.hopLimit - 1,
      });
    }

    return { accepted: true, isForMe };
  }

  /**
   * Enqueues an outgoing or relayed message into the bounded queue
   */
  public enqueueForForwarding(envelope: MessageEnvelope): void {
    // If queue is full, evict lowest priority or oldest item
    if (this.forwardQueue.size >= this.maxQueueCapacity) {
      this.evictLowestPriorityItem();
    }

    this.forwardQueue.set(envelope.messageId, envelope);
  }

  /**
   * Called when a peer becomes reachable nearby via BLE or Wi-Fi Direct.
   * Flushes eligible store-and-forward messages for that peer.
   */
  public async flushQueueForReachablePeer(peerId: string): Promise<number> {
    if (!this.transportDispatcher) return 0;

    let forwarded = 0;
    const now = Date.now();
    const toDelete: string[] = [];

    // Prioritize high/emergency priority envelopes first
    const sortedEnvelopes = Array.from(this.forwardQueue.values()).sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.createdAt - b.createdAt;
    });

    for (const env of sortedEnvelopes) {
      if (env.expiresAt <= now) {
        toDelete.push(env.messageId);
        continue;
      }

      // Do not relay back to origin peer
      if (env.originPeerId === peerId) {
        continue;
      }

      // If directly intended for peer or broadcast or epidemic relay
      const isDestination = env.destinationId === peerId || env.destinationId === '*';
      const isRelayCandidate = env.hopLimit > 0;

      if (isDestination || isRelayCandidate) {
        try {
          const success = await this.transportDispatcher(env, peerId);
          if (success) {
            forwarded++;
            if (env.destinationId === peerId) {
              // Direct delivery completed; remove from relay queue
              toDelete.push(env.messageId);
            }
          }
        } catch {
          // Keep in queue for next opportunistic connection
        }
      }
    }

    // Clean up expired or delivered entries
    for (const id of toDelete) {
      this.forwardQueue.delete(id);
    }

    return forwarded;
  }

  /**
   * Evicts the lowest priority and oldest message when bounded storage is reached
   */
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
