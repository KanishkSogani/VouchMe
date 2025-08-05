import { useEffect, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useToast } from "./useToast";

// Dynamic import types
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!address) {
      setReceivedTestimonials([]);
      return;
    }
  }, [address]);

  useEffect(() => {
    const handleTestimonialReceived = (event: CustomEvent) => {
      const { giverName } = event.detail;
      showSuccess(`New testimonial received from ${giverName}`);
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

        await wakuService.connect();
        const actualConnectionStatus = wakuService.getConnectionStatus();

        if (mounted && actualConnectionStatus) {
          setIsConnected(true);
          showSuccess("Connected to Waku network");
        }
      } catch (error) {
        console.error("Failed to connect to Waku:", error);
        if (mounted) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to connect to Waku network";
          setConnectionError(errorMessage);
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

  useEffect(() => {
    if (!wakuService) return;

    const checkConnectionStatus = async () => {
      try {
        const actualStatus = wakuService.getConnectionStatus();
        if (actualStatus !== isConnected) {
          setIsConnected(actualStatus);
          if (actualStatus) {
            showSuccess("Waku network connected");
          }
        }
      } catch (error) {
        console.error("Failed to check connection status:", error);
      }
    };

    checkConnectionStatus();
    const interval = setInterval(checkConnectionStatus, 3000);
    return () => clearInterval(interval);
  }, [wakuService, isConnected, showSuccess]);

  useEffect(() => {
    if (!isConnected || !address || !wakuService) {
      return;
    }

    const handleTestimonial = (testimonial: WakuTestimonial) => {
      setReceivedTestimonials((currentTestimonials) => {
        const exists = currentTestimonials.some((t) => t.id === testimonial.id);
        if (exists) {
          return currentTestimonials;
        }

        const newTestimonials = [...currentTestimonials, testimonial];

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
      setNotifications((currentNotifications) => {
        const exists = currentNotifications.some(
          (n) => n.id === notification.id
        );
        if (exists) return currentNotifications;
        return [...currentNotifications, notification];
      });
    };

    const registerHandlersWithRetry = async (maxRetries = 3) => {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const unsubscribeTestimonials = wakuService.onTestimonialReceived(
            address,
            handleTestimonial
          );
          const unsubscribeNotifications = wakuService.onNotificationReceived(
            address,
            handleNotification
          );

          return () => {
            unsubscribeTestimonials();
            unsubscribeNotifications();
          };
        } catch (error) {
          console.error(
            `Handler registration attempt ${attempt} failed:`,
            error
          );

          if (attempt === maxRetries) {
            return () => {};
          }

          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    };

    let cleanupFunction: (() => void) | null = null;

    registerHandlersWithRetry().then((cleanup) => {
      cleanupFunction = cleanup || (() => {});
    });

    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [isConnected, address, wakuService, showSuccess]);

  // Send testimonial function
  const sendTestimonial = useCallback(
    async (testimonial: Omit<WakuTestimonial, "id" | "timestamp" | "type">) => {
      try {
        if (!isConnected || !wakuService) {
          throw new Error("Waku not connected. Please wait for connection.");
        }

        const sendPromise = wakuService.sendTestimonial(testimonial);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Testimonial sending timed out after 60 seconds"));
          }, 60000);
        });

        await Promise.race([sendPromise, timeoutPromise]);
      } catch (error) {
        console.error("Failed to send testimonial:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to send testimonial";
        showError(`Failed to send testimonial: ${errorMessage}`);
        throw error;
      }
    },
    [isConnected, wakuService, showError]
  );

  const reconnect = useCallback(async () => {
    if (!wakuService) {
      showError("Waku service not loaded");
      return;
    }

    try {
      setIsConnecting(true);
      setConnectionError(null);

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

    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);

    try {
      showSuccess("Starting testimonial refresh");

      const { wakuService: freshService } = await import(
        "../services/wakuService"
      );

      const refreshPromise = freshService.manualRefreshTestimonials(address);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Refresh timeout after 20 seconds")),
          20000
        )
      );

      const testimonials = await Promise.race([refreshPromise, timeoutPromise]);
      setReceivedTestimonials(testimonials);

      if (testimonials.length > 0) {
        showSuccess(`Found ${testimonials.length} testimonials`);
      } else {
        showSuccess("No testimonials found for this address");
      }

      await freshService.startRealtimeListening(address, (newTestimonial) => {
        setReceivedTestimonials((prev) => {
          const exists = prev.some((t) => t.id === newTestimonial.id);
          if (exists) {
            return prev;
          }
          return [...prev, newTestimonial];
        });
      });
    } catch (error) {
      console.error("Refresh failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to refresh testimonials";

      if (errorMessage.includes("timeout")) {
        showError("Query timed out. Please try again.");
      } else if (errorMessage.includes("connection")) {
        showError("Connection issue. Please check your internet.");
      } else if (errorMessage.includes("Node not available")) {
        showError("Waku node issue. Please wait for connection.");
      } else {
        showError(`Refresh failed: ${errorMessage}`);
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [address, showSuccess, showError, isRefreshing]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeTestimonial = useCallback(
    (testimonialId: string) => {
      setReceivedTestimonials((prev) => {
        const testimonialToRemove = prev.find((t) => t.id === testimonialId);
        const filtered = prev.filter((t) => t.id !== testimonialId);

        if (wakuService && testimonialToRemove && address) {
          if (wakuService.removeTestimonialFromWaku) {
            wakuService
              .removeTestimonialFromWaku(
                testimonialId,
                testimonialToRemove.senderAddress
              )
              .catch((error) => {
                console.error(
                  "Failed to remove testimonial from Waku network:",
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

  useEffect(() => {
    return () => {
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
