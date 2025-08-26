import { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useToast } from "./useToast";

interface WakuTestimonial {
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

interface WakuNotification {
  id: string;
  type: "testimonial_received";
  senderAddress: string;
  receiverAddress: string;
  giverName: string;
  timestamp: number;
}

interface WakuServiceType {
  connect(): Promise<void>;
  sendTestimonial(
    testimonial: Omit<WakuTestimonial, "id" | "timestamp" | "type">
  ): Promise<void>;
  onTestimonialReceived(
    address: string,
    handler: (testimonial: WakuTestimonial) => void
  ): () => void;
  onNotificationReceived(
    address: string,
    handler: (notification: WakuNotification) => void
  ): () => void;
  getConnectionStatus(): boolean;
  getDetailedStatus(): Promise<{
    isConnected: boolean;
    peerCount: number;
    nodeStatus: string;
  }>;
  disconnect(): Promise<void>;
  manualRefreshTestimonials?(address: string): Promise<WakuTestimonial[]>;
  removeTestimonialFromWaku?(
    testimonialId: string,
    senderAddress: string
  ): Promise<void>;
  startRealtimeListening?(
    address: string,
    handler: (testimonial: WakuTestimonial) => void
  ): Promise<void>;
}

export interface UseWakuReturn {
  isConnected: boolean;
  isConnecting: boolean;
  sendTestimonial: (
    testimonial: Omit<WakuTestimonial, "id" | "timestamp" | "type">
  ) => Promise<void>;
  receivedTestimonials: WakuTestimonial[];
  notifications: WakuNotification[];
  clearNotifications: () => void;
  removeTestimonial: (testimonialId: string) => void;
  connectionError: string | null;
  reconnect: () => Promise<void>;
  refreshTestimonials: () => Promise<void>;
  isRefreshing: boolean;
}

export function useWaku(): UseWakuReturn {
  const { address } = useAccount();
  const { showSuccess, showError } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [receivedTestimonials, setReceivedTestimonials] = useState<
    WakuTestimonial[]
  >([]);
  const [notifications, setNotifications] = useState<WakuNotification[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [wakuService, setWakuService] = useState<WakuServiceType | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log("Current retry count:", retryCount);

  useEffect(() => {
    if (!address) {
      setReceivedTestimonials([]);
      return;
    }

    console.log(
      "🌐 Address changed, will fetch testimonials from Waku network for:",
      address
    );
  }, [address]);

  useEffect(() => {
    const handleTestimonialReceived = (event: CustomEvent) => {
      const { giverName } = event.detail;
      showSuccess(`New testimonial received from ${giverName}!`);
    };

    window.addEventListener(
      "wakuTestimonialReceived",
      handleTestimonialReceived as EventListener
    );

    return () => {
      window.removeEventListener(
        "wakuTestimonialReceived",
        handleTestimonialReceived as EventListener
      );
    };
  }, [showSuccess]);

  // Dynamically load Waku service only in browser
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadWakuService = async () => {
      try {
        const { wakuService: service } = await import("@/services/wakuService");
        setWakuService(service);
        console.log("Waku service loaded successfully");
      } catch (error) {
        console.error("Failed to load Waku service:", error);
        setConnectionError("Failed to load Waku service");
      }
    };

    loadWakuService();
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeWaku = async () => {
      if (typeof window === "undefined" || !wakuService) return;

      if (!address || isConnected || isConnecting) return;

      try {
        setIsConnecting(true);
        setConnectionError(null);

        console.log("Attempting to connect to Waku...");
        await wakuService.connect();

        // Check the actual connection status from the service
        const actualConnectionStatus = wakuService.getConnectionStatus();
        console.log(
          "Waku service actual connection status:",
          actualConnectionStatus
        );

        if (mounted && actualConnectionStatus) {
          setIsConnected(true);
          setRetryCount(0); // Reset retry count on success
          console.log("Waku connected successfully");
          showSuccess("Connected to Waku network! (Development Mode)");
        }
      } catch (error) {
        console.error("Failed to connect to Waku:", error);
        if (mounted) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to connect to Waku network";
          setConnectionError(errorMessage);

          // Increment retry count and try again after delay
          setRetryCount((prev) => {
            const newCount = prev + 1;
            if (newCount < 2) {
              console.log(
                `Waku connection failed, retrying in 2 seconds... (attempt ${
                  newCount + 1
                }/2)`
              );
              setTimeout(() => {
                if (mounted) {
                  initializeWaku();
                }
              }, 2000);
            } else {
              showError(
                `Waku connection failed after 2 attempts: ${errorMessage}. Using offline mode.`
              );
            }
            return newCount;
          });
        }
      } finally {
        if (mounted) {
          setIsConnecting(false);
        }
      }
    };

    if (address && wakuService) {
      initializeWaku();
    }

    return () => {
      mounted = false;
    };
  }, [address, wakuService, isConnected, isConnecting, showError, showSuccess]);

  // Periodic connection status check
  useEffect(() => {
    if (!wakuService) return;

    const checkConnectionStatus = async () => {
      try {
        const actualStatus = wakuService.getConnectionStatus();
        if (actualStatus !== isConnected) {
          console.log("Connection status changed:", actualStatus);
          setIsConnected(actualStatus);
          if (actualStatus) {
            showSuccess("Waku network connected!");
          }
        }
      } catch (error) {
        console.error("Failed to check connection status:", error);
      }
    };

    // Check immediately
    checkConnectionStatus();

    // Then check every 3 seconds
    const interval = setInterval(checkConnectionStatus, 3000);

    return () => clearInterval(interval);
  }, [wakuService, isConnected, showSuccess]);

  // Set up message handlers when connected and address is available - ENHANCED VERSION with AUTO-REFRESH
  useEffect(() => {
    if (!isConnected || !address || !wakuService) {
      console.log("Handler setup skipped - missing requirements:", {
        isConnected,
        hasAddress: !!address,
        hasService: !!wakuService,
      });
      return;
    }

    console.log(
      "🔧 Setting up ENHANCED Waku message handlers for address:",
      address
    );

    // Create stable handler function that won't change
    const handleTestimonial = (testimonial: WakuTestimonial) => {
      console.log(
        "📥 ENHANCED HANDLER TRIGGERED: Received testimonial via Waku:",
        testimonial
      );

      // Use functional update to avoid stale closure issues
      setReceivedTestimonials((currentTestimonials) => {
        console.log(
          "📥 Current testimonials in handler:",
          currentTestimonials.length
        );

        // Check if we already have this testimonial
        const exists = currentTestimonials.some((t) => t.id === testimonial.id);
        if (exists) {
          console.log("Testimonial already exists, skipping");
          return currentTestimonials;
        }

        console.log("Adding new testimonial to enhanced state");
        const newTestimonials = [...currentTestimonials, testimonial];

        // Show success notification
        setTimeout(() => {
          if (typeof window !== "undefined") {
            const event = new CustomEvent("wakuTestimonialReceived", {
              detail: { giverName: testimonial.giverName },
            });
            window.dispatchEvent(event);
          }
        }, 100);

        return newTestimonials;
      });
    };

    const handleNotification = (notification: WakuNotification) => {
      console.log(
        "🔔 ENHANCED HANDLER: Received notification via Waku:",
        notification
      );
      setNotifications((currentNotifications) => {
        const exists = currentNotifications.some(
          (n) => n.id === notification.id
        );
        if (exists) return currentNotifications;
        return [...currentNotifications, notification];
      });
    };

    // Add retry logic for handler registration
    const registerHandlersWithRetry = async (maxRetries = 3) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(
            `🔧 Registering handlers (attempt ${attempt}/${maxRetries})`
          );

          // Register handlers
          const unsubscribeTestimonials = wakuService.onTestimonialReceived(
            address,
            handleTestimonial
          );
          const unsubscribeNotifications = wakuService.onNotificationReceived(
            address,
            handleNotification
          );

          console.log("Handlers registered successfully");

          return () => {
            console.log(
              "Cleaning up UNIFORM Waku handlers for address:",
              address
            );
            unsubscribeTestimonials();
            unsubscribeNotifications();
          };
          setTimeout(async () => {
            try {
              console.log("Starting automatic testimonial query");

              if (!address) return;

              console.log("Auto-refresh starting for address:", address);
              setIsRefreshing(true);

              try {
                // Import the corrected service directly
                const { wakuService } = await import("../services/wakuService");

                console.log("Calling manualRefreshTestimonials");
                const testimonials =
                  await wakuService.manualRefreshTestimonials(address);

                console.log(
                  `Successfully fetched ${testimonials.length} testimonials`
                );

                if (testimonials.length > 0) {
                  console.log("Updating React state with testimonials");
                  setReceivedTestimonials(testimonials);
                  showSuccess(
                    `Auto-refresh complete! Found ${testimonials.length} testimonials`
                  );
                }
              } catch (error) {
                console.warn(
                  "🔧 AUTO-REFRESH: Query failed (non-critical):",
                  error
                );
              } finally {
                setIsRefreshing(false);
              }
            } catch (error) {
              console.warn(
                "🔧 AUTO-REFRESH: Automatic query failed (non-critical):",
                error
              );
            }
          }, 2000);

          return () => {
            console.log(
              "🧹 Cleaning up ENHANCED Waku handlers for address:",
              address
            );
            unsubscribeTestimonials();
            unsubscribeNotifications();
          };
        } catch (error) {
          console.error(
            `🔧 Handler registration attempt ${attempt} failed:`,
            error
          );

          if (attempt === maxRetries) {
            console.error("All handler registration attempts failed");
            return () => {}; // Return empty cleanup function
          }

          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    };

    // Register handlers with retry logic
    let cleanupFunction: (() => void) | null = null;

    registerHandlersWithRetry().then((cleanup) => {
      cleanupFunction = cleanup || (() => {});
    });

    // Cleanup function
    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [isConnected, address, wakuService, showSuccess]); // Removed refreshTestimonials from dependencies

  // Send testimonial function
  const sendTestimonial = useCallback(
    async (testimonial: Omit<WakuTestimonial, "id" | "timestamp" | "type">) => {
      console.log("useWaku sendTestimonial called with:", testimonial);
      console.log(
        "🎯 isConnected:",
        isConnected,
        "wakuService:",
        !!wakuService
      );

      try {
        if (!isConnected || !wakuService) {
          throw new Error("Waku not connected. Please wait for connection.");
        }

        console.log("Calling wakuService.sendTestimonial...");

        // Increase timeout and add better logging
        const sendPromise = wakuService.sendTestimonial(testimonial);
        const timeoutPromise = new Promise((_, reject) => {
          const timeoutId = setTimeout(() => {
            console.error(
              "🎯 TIMEOUT: Testimonial sending timed out after 60 seconds"
            );
            reject(new Error("Testimonial sending timed out after 60 seconds"));
          }, 60000); // Increased to 60 seconds
          return timeoutId;
        });

        console.log("Starting Promise.race with 60s timeout...");
        await Promise.race([sendPromise, timeoutPromise]);
        console.log("wakuService.sendTestimonial completed successfully!");

        console.log("Testimonial sent successfully, returning to write page");
      } catch (error) {
        console.error("Failed to send testimonial:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to send testimonial";
        console.error("Error details:", errorMessage);
        showError(`Failed to send testimonial: ${errorMessage}`);
        throw error;
      }
    },
    [isConnected, wakuService, showError]
  );

  // Manual reconnect function
  const reconnect = useCallback(async () => {
    if (!wakuService) {
      showError("Waku service not loaded");
      return;
    }

    try {
      setIsConnecting(true);
      setConnectionError(null);
      setRetryCount(0); // Reset retry count for manual attempts

      console.log("Manual reconnection initiated...");
      // Try to reconnect by disconnecting and connecting again
      await wakuService.disconnect();
      await wakuService.connect();

      setIsConnected(true);
      showSuccess("Successfully reconnected to Waku network!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reconnect";
      setConnectionError(errorMessage);
      showError(`Reconnection failed: ${errorMessage}`);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [wakuService, showSuccess, showError]);

  const refreshTestimonials = useCallback(async () => {
    if (!address) {
      showError("No wallet address available");
      return;
    }

    // Prevent multiple concurrent refreshes
    if (isRefreshing) {
      console.warn("Refresh already in progress, skipping");
      return;
    }

    console.log("Starting consistent Store query for address:", address);
    setIsRefreshing(true);

    try {
      showSuccess("Starting testimonial refresh...");

      console.log("Calling optimized refresh method with consistent timing");

      const { wakuService: freshService } = await import(
        "../services/wakuService"
      );

      const refreshPromise = freshService.manualRefreshTestimonials(address);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout please try again!")), 20000)
      );

      const testimonials = await Promise.race([refreshPromise, timeoutPromise]);

      console.log(
        `Successfully fetched ${testimonials.length} testimonials with consistent query`
      );

      console.log("Updating React state with testimonials");
      setReceivedTestimonials(testimonials);

      if (testimonials.length > 0) {
        showSuccess(`Found ${testimonials.length} testimonials`);
      } else {
        showSuccess("No testimonials found for this address.");
      }

      console.log("Setting up real-time listening for new testimonials");
      await freshService.startRealtimeListening(address, (newTestimonial) => {
        console.log("Real-time testimonial received:", newTestimonial);

        setReceivedTestimonials((prev) => {
          const exists = prev.some((t) => t.id === newTestimonial.id);
          if (exists) {
            console.log("Testimonial already exists, skipping");
            return prev;
          }

          console.log("Adding new testimonial to state");
          return [...prev, newTestimonial];
        });
      });
      console.log("Real-time listening started successfully");
    } catch (error) {
      console.error("Query failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to refresh testimonials";

      // More specific error messages for the uniform implementation
      if (errorMessage.includes("timeout")) {
        showError("Timed Out, Please try again.");
      } else if (errorMessage.includes("connection")) {
        showError(
          "Connection issue. Please check your internet and try again."
        );
      } else if (errorMessage.includes("Node not available")) {
        showError("Waku node issue. Please wait for connection and try again.");
      } else {
        showError(`${errorMessage}`);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [address, showSuccess, showError, isRefreshing]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Remove testimonial from Waku decentralized storage
  const removeTestimonial = useCallback(
    (testimonialId: string) => {
      console.log("Removing testimonial from Waku state:", testimonialId);

      // Remove from React state
      setReceivedTestimonials((prev) => {
        const testimonialToRemove = prev.find((t) => t.id === testimonialId);
        const filtered = prev.filter((t) => t.id !== testimonialId);
        console.log("Testimonials after removal:", filtered.length);

        // Also remove from Waku network storage if service is available
        if (wakuService && testimonialToRemove && address) {
          if (wakuService.removeTestimonialFromWaku) {
            console.log("Removing testimonial from Waku network...");
            wakuService
              .removeTestimonialFromWaku(
                testimonialId,
                testimonialToRemove.senderAddress
              )
              .then(() => {
                console.log(
                  "✅ Testimonial successfully removed from Waku network"
                );
              })
              .catch((error) => {
                console.error(
                  "❌ Failed to remove testimonial from Waku network:",
                  error
                );
              });
          }
        }

        return filtered;
      });
    },
    [wakuService, address]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Only disconnect if the component is being unmounted completely
      // In a real app, you might want to keep the connection alive across page changes
      if (wakuService) {
        wakuService.disconnect().catch(console.error);
      }
    };
  }, [wakuService]);

  return {
    isConnected,
    isConnecting,
    sendTestimonial,
    receivedTestimonials,
    notifications,
    clearNotifications,
    removeTestimonial,
    connectionError,
    reconnect,
    refreshTestimonials,
    isRefreshing,
  };
}
