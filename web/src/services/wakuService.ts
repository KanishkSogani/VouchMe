import {
  LightNode,
  createLightNode,
  createEncoder,
  createDecoder,
  Protocols,
} from "@waku/sdk";
import protobuf from "protobufjs";

export interface WakuTestimonial {
  id: string;
  senderAddress: string;
  receiverAddress: string;
  content: string;
  giverName: string;
  profileUrl: string;
  signature: string;
  timestamp: number;
  type: "testimonial";
}

export interface WakuNotification {
  id: string;
  type: "testimonial_received";
  senderAddress: string;
  receiverAddress: string;
  giverName: string;
  timestamp: number;
}

interface DecodedTestimonialMessage {
  id: string;
  senderAddress: string;
  receiverAddress: string;
  content: string;
  giverName: string;
  profileUrl: string;
  signature: string;
  timestamp: string;
  type: string;
}

const TestimonialMessage = new protobuf.Type("TestimonialMessage")
  .add(new protobuf.Field("id", 1, "string"))
  .add(new protobuf.Field("senderAddress", 2, "string"))
  .add(new protobuf.Field("receiverAddress", 3, "string"))
  .add(new protobuf.Field("content", 4, "string"))
  .add(new protobuf.Field("giverName", 5, "string"))
  .add(new protobuf.Field("profileUrl", 6, "string"))
  .add(new protobuf.Field("signature", 7, "string"))
  .add(new protobuf.Field("timestamp", 8, "uint64"))
  .add(new protobuf.Field("type", 9, "string"));

class FixedWakuService {
  private node: LightNode | null = null;
  private isConnected = false;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  private messageHandlers: Map<string, (message: WakuTestimonial) => void> =
    new Map();
  private notificationHandlers: Map<
    string,
    (notification: WakuNotification) => void
  > = new Map();

  private readonly contentTopic = "/vouchme/1/testimonials/proto";

  constructor() {
    if (typeof window !== "undefined") {
      (
        window as unknown as { wakuServiceForTesting: FixedWakuService }
      ).wakuServiceForTesting = this;
    }
  }

  private decodeTestimonialMessage(
    payload: Uint8Array
  ): WakuTestimonial | null {
    try {
      const messageObj = TestimonialMessage.decode(payload);
      const decoded = messageObj as unknown as DecodedTestimonialMessage;

      return {
        id: decoded.id,
        senderAddress: decoded.senderAddress,
        receiverAddress: decoded.receiverAddress,
        content: decoded.content,
        giverName: decoded.giverName,
        profileUrl: decoded.profileUrl,
        signature: decoded.signature,
        timestamp: parseInt(decoded.timestamp),
        type: "testimonial",
      };
    } catch (error) {
      console.error("🔧 FIXED: Failed to decode testimonial message:", error);
      return null;
    }
  }

  // 🚀 Simplified connection method
  async connect(): Promise<void> {
    if (typeof window === "undefined") {
      console.log(
        "🚀 FIXED: Server-side environment detected, skipping connection"
      );
      return;
    }

    if (this.isConnected) {
      console.log("✅ FIXED: Already connected");
      return;
    }

    if (this.isInitializing && this.initPromise) {
      console.log("⏳ FIXED: Connection in progress, waiting...");
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = this._doConnect();

    try {
      await this.initPromise;
    } finally {
      this.isInitializing = false;
    }
  }

  private async _doConnect(): Promise<void> {
    try {
      console.log("🚀 FIXED: Creating Waku Light Node...");

      this.node = await createLightNode({
        defaultBootstrap: true,
      });

      console.log("📡 FIXED: Starting node...");
      await this.node.start();

      console.log("🔗 FIXED: Waiting for Store peers...");
      await this.node.waitForPeers([Protocols.Store]);
      console.log("✅ FIXED: Store peers connected");

      console.log("🔗 FIXED: Waiting for LightPush peers...");
      await this.node.waitForPeers([Protocols.LightPush]);
      console.log("✅ FIXED: LightPush peers connected");

      console.log("🔗 FIXED: Waiting for Filter peers...");
      await this.node.waitForPeers([Protocols.Filter]);
      console.log("✅ FIXED: Filter peers connected");

      const connections = (this.node as LightNode).libp2p.getConnections();
      console.log(`🔗 FIXED: Verified ${connections.length} peer connections`);

      if (connections.length === 0) {
        throw new Error("No peer connections established");
      }

      console.log("⏱️ FIXED: Connection stabilization...");
      await new Promise((resolve) => setTimeout(resolve, 2000));

      this.isConnected = true;
      console.log("✅ FIXED: Waku service ready!");
    } catch (error) {
      console.error("❌ FIXED: Connection failed:", error);
      this.isConnected = false;
      this.initPromise = null;

      if (this.node) {
        try {
          await this.node.stop();
        } catch (stopError) {
          console.warn("⚠️ FIXED: Node cleanup error:", stopError);
        }
        this.node = null;
      }

      throw error;
    }
  }

  // 🎯 UNIFORM SOLUTION: Fast, consistent testimonial fetching every time
  async manualRefreshTestimonials(
    receiverAddress: string
  ): Promise<WakuTestimonial[]> {
    console.log(
      `🔄 UNIFORM: Starting fast and consistent Store query for ${receiverAddress}`
    );

    try {
      // Quick connection check
      if (!this.node || !this.isConnected) {
        console.log("🔌 UNIFORM: Ensuring connection...");
        await this.connect();
      }

      if (!this.node) {
        throw new Error("Node not available");
      }

      // Initialize removal system only once
      await this.initializeRemovalSystem();

      // Execute single optimized query - no multiple strategies
      console.log("� UNIFORM: Executing optimized single query...");
      const testimonials = await this.executeUniformQuery(receiverAddress);

      console.log(
        `✅ UNIFORM: Query completed successfully! Found ${testimonials.length} testimonials`
      );
      return testimonials;
    } catch (error) {
      console.error("❌ UNIFORM: Query failed:", error);
      throw error; // Let the caller handle the error properly
    }
  }

  // Ensure robust connection with multiple retries
  private async ensureRobustConnection(): Promise<void> {
    console.log("🔧 BULLETPROOF: Ensuring robust connection...");

    if (!this.node) {
      console.log("� Creating new node connection...");
      await this.connect();
    }

    if (!this.node) {
      throw new Error("Failed to create node");
    }

    // Check if we actually have good peer connections
    const peerCount = (await (this.node as LightNode).libp2p.peerStore.all())
      .length;
    if (peerCount === 0) {
      console.log("🔧 No peers found, reconnecting...");
      await this.reconnectWithBackoff();
    }

    console.log(`🔧 BULLETPROOF: Connection verified with ${peerCount} peers`);
  }

  // Reconnect with exponential backoff
  private async reconnectWithBackoff(): Promise<void> {
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Reconnection attempt ${attempt}/${maxRetries}`);

        // Clean disconnect first
        if (this.node) {
          await this.node.stop();
          this.node = null;
        }

        // Wait before reconnecting
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));

        // Reconnect
        await this.connect();

        // Verify connection
        if (this.node) {
          try {
            const peerCount = (
              await (this.node as LightNode).libp2p.peerStore.all()
            ).length;
            if (peerCount > 0) {
              console.log(`✅ Reconnection successful with ${peerCount} peers`);
              return;
            }
          } catch (error) {
            console.warn("⚠️ Error checking peer count:", error);
          }
        }
      } catch (error) {
        console.warn(`⚠️ Reconnection attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          throw new Error("Failed to establish peer connections after retries");
        }
      }
    }
  }

  // 🚀 UNIFORM: Single optimized query method for consistent performance
  private async executeUniformQuery(
    receiverAddress: string
  ): Promise<WakuTestimonial[]> {
    const testimonials: WakuTestimonial[] = [];
    const decoder = createDecoder(this.contentTopic);
    let messageCount = 0;

    console.log("🔍 UNIFORM: Setting up message callback...");

    const callback = (wakuMessage: {
      payload?: Uint8Array;
      timestamp?: Date;
    }) => {
      messageCount++;
      console.log(`📨 UNIFORM: Processing message ${messageCount}...`);

      if (!wakuMessage.payload) {
        console.log("⚠️ UNIFORM: Message has no payload, skipping");
        return;
      }

      try {
        const decoded = this.decodeTestimonialMessage(wakuMessage.payload);
        if (!decoded) {
          console.log("⚠️ UNIFORM: Failed to decode message");
          return;
        }

        // Filter for the specific receiver
        if (
          decoded.receiverAddress.toLowerCase() ===
          receiverAddress.toLowerCase()
        ) {
          // Check if testimonial is not removed
          if (!this.isTestimonialRemoved(decoded.id)) {
            testimonials.push(decoded);
            console.log(
              `✅ UNIFORM: Found testimonial from ${decoded.senderAddress}`
            );
          } else {
            console.log(
              `🗑️ UNIFORM: Skipping removed testimonial ${decoded.id}`
            );
          }
        }
      } catch (error) {
        console.error("❌ UNIFORM: Error processing message:", error);
      }
    };

    // Optimized query options: balanced between performance and completeness
    const queryOptions = {
      pageDirection: "backward" as const,
      includeData: true,
      paginationLimit: 50, // Reasonable limit for fast queries
      timeFilter: {
        startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days
        endTime: new Date(),
      },
    };

    console.log("🚀 UNIFORM: Executing optimized query with 15s timeout...");

    // Execute query with a reasonable timeout
    const queryPromise = this.node!.store.queryWithOrderedCallback(
      [decoder],
      callback,
      queryOptions
    );

    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(
        () => reject(new Error("Query timeout after 15 seconds")),
        15000 // Reduced timeout for faster UX
      );
    });

    await Promise.race([queryPromise, timeoutPromise]);

    console.log(
      `✅ UNIFORM: Query completed! Processed ${messageCount} messages, found ${testimonials.length} testimonials`
    );

    return testimonials.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Strategy 3: Fallback query without time filter
  private async executeFallbackQuery(
    receiverAddress: string
  ): Promise<WakuTestimonial[]> {
    const testimonials: WakuTestimonial[] = [];
    const decoder = createDecoder(this.contentTopic);
    let messageCount = 0;

    const callback = (wakuMessage: {
      payload?: Uint8Array;
      timestamp?: Date;
    }) => {
      messageCount++;
      console.log(`📨 FALLBACK: Processing message ${messageCount}`);

      try {
        if (!wakuMessage?.payload) return false;

        const testimonial = this.decodeTestimonialMessage(wakuMessage.payload);
        if (!testimonial) return false;

        // Filter out removed testimonials
        if (this.isTestimonialRemoved(testimonial.id)) {
          console.log(
            `🗑️ FALLBACK: Skipping removed testimonial ${testimonial.id}`
          );
          return false;
        }

        if (
          testimonial.receiverAddress?.toLowerCase() ===
          receiverAddress.toLowerCase()
        ) {
          testimonials.push(testimonial);
          console.log(
            `✅ FALLBACK: Found matching testimonial ${testimonial.id}`
          );
        }

        // Process more messages in fallback
        return messageCount >= 100;
      } catch (error) {
        console.warn(
          `⚠️ FALLBACK: Error processing message ${messageCount}:`,
          error
        );
      }

      return false;
    };

    const queryOptions = {
      pageDirection: "backward" as const,
      includeData: true,
      paginationLimit: 100,
      // No timeFilter for maximum reach
    };

    console.log("🚀 FALLBACK: Executing fallback query without time filter...");

    const queryPromise = this.node!.store.queryWithOrderedCallback(
      [decoder],
      callback,
      queryOptions
    );
    const timeoutPromise = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error("Fallback query timeout")), 40000); // 40s timeout for thorough search
    });

    await Promise.race([queryPromise, timeoutPromise]);

    console.log(
      `✅ UNIFORM: Query completed! Processed ${messageCount} messages, found ${testimonials.length} testimonials`
    );

    return testimonials.sort((a, b) => b.timestamp - a.timestamp);
  }

  // �️ Remove testimonial from Waku network
  async removeTestimonialFromWaku(
    testimonialId: string,
    senderAddress: string
  ): Promise<void> {
    console.log(
      `🗑️ BULLETPROOF: Removing testimonial ${testimonialId} from Waku network`
    );

    try {
      await this.connect();

      if (!this.node) {
        throw new Error("Node not available");
      }

      // Create a "removal" message that indicates this testimonial should be ignored
      const removalMessage = {
        id: `removal_${testimonialId}_${Date.now()}`,
        originalTestimonialId: testimonialId,
        senderAddress: senderAddress.toLowerCase(),
        action: "remove",
        timestamp: Date.now(),
        type: "testimonial_removal",
      };

      console.log("📋 BULLETPROOF: Removal message to send:", removalMessage);

      // Create a simple removal message structure
      const RemovalMessage = new protobuf.Type("RemovalMessage")
        .add(new protobuf.Field("id", 1, "string"))
        .add(new protobuf.Field("originalTestimonialId", 2, "string"))
        .add(new protobuf.Field("senderAddress", 3, "string"))
        .add(new protobuf.Field("action", 4, "string"))
        .add(new protobuf.Field("timestamp", 5, "uint64"))
        .add(new protobuf.Field("type", 6, "string"));

      // Use a different content topic for removals
      const removalContentTopic = "/vouchme/1/removals/proto";
      const encoder = createEncoder({
        contentTopic: removalContentTopic,
      });

      const protoMessage = RemovalMessage.create(removalMessage);
      const serializedMessage = RemovalMessage.encode(protoMessage).finish();

      console.log(
        `📨 BULLETPROOF: Removal message serialized (${serializedMessage.length} bytes)`
      );

      const sendResult = await this.node.lightPush.send(encoder, {
        payload: serializedMessage,
      });

      console.log(
        "✅ BULLETPROOF: Removal message sent successfully",
        sendResult
      );

      // Also store the removal locally to filter out during queries
      this.addToRemovedList(testimonialId);
    } catch (error) {
      console.error("❌ BULLETPROOF: Failed to send removal message:", error);
      throw error;
    }
  }

  // 🗑️ Persistent removal system using Waku network
  private removedTestimonials: Set<string> = new Set();

  // Load removal messages at service start
  async initializeRemovalSystem(): Promise<void> {
    console.log("🔧 REMOVAL: Initializing removal system...");
    try {
      await this.queryRemovalMessages();
      console.log(
        `✅ REMOVAL: System initialized with ${this.removedTestimonials.size} removed testimonials`
      );
    } catch (error) {
      console.warn("⚠️ REMOVAL: Failed to initialize removal system:", error);
    }
  }

  // Query removal messages from the network
  private async queryRemovalMessages(): Promise<void> {
    if (!this.node) {
      console.warn("🔍 REMOVAL: Node not available for removal query");
      return;
    }

    const removalContentTopic = "/vouchme/1/removals/proto";
    const decoder = createDecoder(removalContentTopic);

    console.log("🔍 REMOVAL: Starting removal message query...");

    interface RemovalMessageData {
      id: string;
      originalTestimonialId: string;
      senderAddress: string;
      action: string;
      timestamp: string;
      type: string;
    }

    const callback = (wakuMessage: {
      payload?: Uint8Array;
      timestamp?: Date;
    }) => {
      try {
        if (!wakuMessage?.payload) return false;

        // Create removal message decoder
        const RemovalMessage = new protobuf.Type("RemovalMessage")
          .add(new protobuf.Field("id", 1, "string"))
          .add(new protobuf.Field("originalTestimonialId", 2, "string"))
          .add(new protobuf.Field("senderAddress", 3, "string"))
          .add(new protobuf.Field("action", 4, "string"))
          .add(new protobuf.Field("timestamp", 5, "uint64"))
          .add(new protobuf.Field("type", 6, "string"));

        const messageObj = RemovalMessage.decode(wakuMessage.payload);
        const removalData = messageObj as unknown as RemovalMessageData;

        if (
          removalData.action === "remove" &&
          removalData.originalTestimonialId
        ) {
          this.removedTestimonials.add(removalData.originalTestimonialId);
          console.log(
            `🗑️ REMOVAL: Found removal for testimonial ${removalData.originalTestimonialId}`
          );
        }

        return false; // Continue processing all removal messages
      } catch (error) {
        console.warn("⚠️ REMOVAL: Error processing removal message:", error);
        return false;
      }
    };

    const queryOptions = {
      pageDirection: "backward" as const,
      includeData: true,
      paginationLimit: 200,
      // Query last 30 days of removal messages
      timeFilter: {
        startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endTime: new Date(),
      },
    };

    try {
      await this.node.store.queryWithOrderedCallback(
        [decoder],
        callback,
        queryOptions
      );
      console.log(
        `✅ REMOVAL: Query complete. Total removed testimonials: ${this.removedTestimonials.size}`
      );
    } catch (error) {
      console.error("❌ REMOVAL: Failed to query removal messages:", error);
    }
  }

  private addToRemovedList(testimonialId: string): void {
    this.removedTestimonials.add(testimonialId);
    console.log(`🗑️ REMOVAL: Added ${testimonialId} to removal list`);
  }

  private isTestimonialRemoved(testimonialId: string): boolean {
    return this.removedTestimonials.has(testimonialId);
  }
  async sendTestimonial(
    testimonial: Omit<WakuTestimonial, "id" | "timestamp" | "type">
  ): Promise<void> {
    console.log("📤 FIXED: Sending testimonial");

    await this.connect();

    if (!this.node) {
      throw new Error("Node not available");
    }

    const fullTestimonial: WakuTestimonial = {
      ...testimonial,
      senderAddress: testimonial.senderAddress.toLowerCase(),
      receiverAddress: testimonial.receiverAddress.toLowerCase(),
      id: this.generateId(),
      timestamp: Date.now(),
      type: "testimonial",
    };

    console.log("📋 FIXED: Testimonial to send:", {
      id: fullTestimonial.id,
      from: fullTestimonial.senderAddress,
      to: fullTestimonial.receiverAddress,
      contentTopic: this.contentTopic,
    });

    const encoder = createEncoder({
      contentTopic: this.contentTopic,
    });

    const protoMessage = TestimonialMessage.create({
      id: fullTestimonial.id,
      senderAddress: fullTestimonial.senderAddress,
      receiverAddress: fullTestimonial.receiverAddress,
      content: fullTestimonial.content,
      giverName: fullTestimonial.giverName,
      profileUrl: fullTestimonial.profileUrl,
      signature: fullTestimonial.signature,
      timestamp: fullTestimonial.timestamp.toString(),
      type: fullTestimonial.type,
    });

    const serializedMessage = TestimonialMessage.encode(protoMessage).finish();
    console.log(
      `📨 FIXED: Message serialized (${serializedMessage.length} bytes)`
    );

    const sendResult = await this.node.lightPush.send(encoder, {
      payload: serializedMessage,
    });

    console.log("✅ FIXED: Testimonial sent successfully", sendResult);
  }

  // Utility methods
  private generateId(): string {
    return `testimonial_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  async disconnect(): Promise<void> {
    console.log("🔄 FIXED: Disconnecting...");
    this.isConnected = false;
    this.initPromise = null;

    if (this.node) {
      try {
        await this.node.stop();
        console.log("✅ FIXED: Node stopped successfully");
      } catch (error) {
        console.warn("⚠️ FIXED: Error stopping node:", error);
      }
      this.node = null;
    }
  }

  onTestimonialReceived(
    address: string,
    handler: (testimonial: WakuTestimonial) => void
  ): () => void {
    const key = address.toLowerCase();
    this.messageHandlers.set(key, handler);
    console.log(`🔔 UNIFORM: Registered handler for ${address}`);

    // Start live message listening for real-time testimonials
    this.startLiveMessageListening(address, handler);

    // REMOVED: Automatic refresh that was causing multiple concurrent calls
    // Manual refresh should be called explicitly by user interaction

    return () => {
      this.messageHandlers.delete(key);
      console.log(`🔔 UNIFORM: Unregistered handler for ${address}`);
    };
  }

  // 🔔 PUBLIC: Start real-time testimonial listening for an address
  async startRealtimeListening(
    address: string,
    handler: (testimonial: WakuTestimonial) => void
  ): Promise<void> {
    if (!this.isConnected) {
      console.log(
        "🔔 BULLETPROOF: Node not connected, skipping live listening"
      );
      return;
    }

    console.log(`🔔 BULLETPROOF: Starting real-time listening for ${address}`);
    await this.startLiveMessageListening(address, handler);
  }

  // 🎯 CRITICAL: Real-time message listening using Filter protocol
  private async startLiveMessageListening(
    address: string,
    handler: (testimonial: WakuTestimonial) => void
  ): Promise<void> {
    try {
      if (!this.node) {
        console.warn("🔔 BULLETPROOF: Node not available for live listening");
        return;
      }

      console.log(
        `🔔 BULLETPROOF: Starting live message listening for ${address}`
      );

      const decoder = createDecoder(this.contentTopic);

      const callback = (wakuMessage: {
        payload?: Uint8Array;
        timestamp?: Date;
      }) => {
        console.log("🔔 BULLETPROOF: Live message received!", wakuMessage);

        try {
          if (!wakuMessage?.payload) {
            console.log("🔔 BULLETPROOF: Live message has no payload");
            return;
          }

          const testimonial = this.decodeTestimonialMessage(
            wakuMessage.payload
          );
          if (!testimonial) {
            console.log("🔔 BULLETPROOF: Failed to decode live message");
            return;
          }

          console.log(`🔔 BULLETPROOF: Decoded live testimonial:`, testimonial);

          // Filter out removed testimonials
          if (this.isTestimonialRemoved(testimonial.id)) {
            console.log(
              `🗑️ BULLETPROOF: Skipping removed live testimonial ${testimonial.id}`
            );
            return;
          }

          // Check if this testimonial is for our address
          if (
            testimonial.receiverAddress?.toLowerCase() === address.toLowerCase()
          ) {
            console.log(
              `✅ BULLETPROOF: Live testimonial matches address ${address}`
            );

            // Call the handler to update the UI
            handler(testimonial);

            // Also trigger the custom event for toast notification
            if (typeof window !== "undefined") {
              console.log(
                "🔔 BULLETPROOF: Dispatching wakuTestimonialReceived event"
              );
              const event = new CustomEvent("wakuTestimonialReceived", {
                detail: { giverName: testimonial.giverName },
              });
              window.dispatchEvent(event);
            }
          } else {
            console.log(
              `⏭️ BULLETPROOF: Live testimonial for different address: ${testimonial.receiverAddress} (looking for ${address})`
            );
          }
        } catch (error) {
          console.error(
            "🔔 BULLETPROOF: Error processing live message:",
            error
          );
        }
      };

      // Use the correct Filter API
      await this.node.filter.subscribe([decoder], callback);
      console.log(
        `✅ BULLETPROOF: Live message subscription active for ${address}`
      );
    } catch (error) {
      console.error(
        "🔔 BULLETPROOF: Failed to start live message listening:",
        error
      );
    }
  }

  onNotificationReceived(
    address: string,
    handler: (notification: WakuNotification) => void
  ): () => void {
    const key = address.toLowerCase();
    this.notificationHandlers.set(key, handler);
    console.log(`🔔 FIXED: Registered notification handler for ${address}`);

    return () => {
      this.notificationHandlers.delete(key);
      console.log(`🔔 FIXED: Unregistered notification handler for ${address}`);
    };
  }

  async getDetailedStatus(): Promise<{
    isConnected: boolean;
    peerCount: number;
    nodeStatus: string;
  }> {
    const peerCount = this.node
      ? (this.node as LightNode).libp2p.getConnections().length
      : 0;
    const nodeStatus = this.isConnected
      ? "connected"
      : this.isInitializing
      ? "connecting"
      : "disconnected";

    return {
      isConnected: this.isConnected,
      peerCount,
      nodeStatus,
    };
  }

  // 🧪 Test handler for dashboard testing functionality
  testHandler(recipientAddress: string): void {
    console.log(`🧪 FIXED TEST: Triggering handler for ${recipientAddress}`);

    const testTestimonial: WakuTestimonial = {
      id: `fixed-test-${Date.now()}`,
      senderAddress: "0x1234567890123456789012345678901234567890",
      receiverAddress: recipientAddress.toLowerCase(),
      content:
        "🧪 FIXED TEST: Corrected Waku Store protocol testimonial - using proper pageDirection and timeFilter!",
      giverName: "Fixed Test User",
      profileUrl: "https://example.com/test-profile.jpg",
      signature: "fixed-test-signature",
      timestamp: Date.now(),
      type: "testimonial",
    };

    const handler = this.messageHandlers.get(recipientAddress.toLowerCase());
    if (handler) {
      console.log(`🧪 FIXED TEST: Delivering testimonial:`, testTestimonial);
      handler(testTestimonial);
    } else {
      console.log(`🧪 FIXED TEST: No handler found for ${recipientAddress}`);
    }
  }
}

export const wakuService = new FixedWakuService();
