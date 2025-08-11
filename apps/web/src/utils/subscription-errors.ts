// Utility functions for handling subscription errors

export interface SubscriptionError {
	code?: string;
	message: string;
	userMessage: string;
	retryable: boolean;
}

export function parseSubscriptionError(error: any): SubscriptionError {
	// Handle Better Auth specific errors
	if (error?.message) {
		const message = error.message.toLowerCase();

		// Authentication errors
		if (
			message.includes("unauthorized") ||
			message.includes("authentication")
		) {
			return {
				code: "AUTH_REQUIRED",
				message: error.message,
				userMessage: "Please sign in to manage your subscription.",
				retryable: false,
			};
		}

		// Stripe payment errors
		if (message.includes("payment") || message.includes("card")) {
			return {
				code: "PAYMENT_ERROR",
				message: error.message,
				userMessage:
					"There was an issue with your payment method. Please check your payment details.",
				retryable: true,
			};
		}

		// Network errors
		if (message.includes("network") || message.includes("fetch")) {
			return {
				code: "NETWORK_ERROR",
				message: error.message,
				userMessage:
					"Connection issue. Please check your internet connection and try again.",
				retryable: true,
			};
		}

		// Subscription not found
		if (message.includes("subscription") && message.includes("not found")) {
			return {
				code: "SUBSCRIPTION_NOT_FOUND",
				message: error.message,
				userMessage:
					"No active subscription found. Please contact support if this seems incorrect.",
				retryable: false,
			};
		}

		// Plan errors
		if (message.includes("plan") || message.includes("price")) {
			return {
				code: "INVALID_PLAN",
				message: error.message,
				userMessage:
					"The selected plan is no longer available. Please refresh the page and try again.",
				retryable: true,
			};
		}

		// Rate limiting
		if (message.includes("rate") || message.includes("too many")) {
			return {
				code: "RATE_LIMIT",
				message: error.message,
				userMessage: "Too many requests. Please wait a moment and try again.",
				retryable: true,
			};
		}

		// Generic Stripe errors
		if (message.includes("stripe")) {
			return {
				code: "STRIPE_ERROR",
				message: error.message,
				userMessage:
					"Payment service error. Please try again or contact support.",
				retryable: true,
			};
		}
	}

	// Fallback for unknown errors
	return {
		code: "UNKNOWN_ERROR",
		message: error?.message || "Unknown error occurred",
		userMessage:
			"An unexpected error occurred. Please try again or contact support.",
		retryable: true,
	};
}

export function getRetryDelay(attemptCount: number): number {
	// Exponential backoff: 1s, 2s, 4s, 8s, max 30s
	return Math.min(1000 * 2 ** attemptCount, 30000);
}

export function shouldRetryError(
	error: SubscriptionError,
	attemptCount: number,
): boolean {
	return error.retryable && attemptCount < 3;
}

export function formatErrorForDisplay(error: any): string {
	const parsedError = parseSubscriptionError(error);
	return parsedError.userMessage;
}
