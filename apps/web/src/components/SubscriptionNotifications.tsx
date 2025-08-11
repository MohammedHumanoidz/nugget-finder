"use client";

import { AlertTriangle, CheckCircle, X, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface NotificationProps {
	type: "success" | "error" | "warning";
	title: string;
	message: string;
	onDismiss: () => void;
}

function Notification({ type, title, message, onDismiss }: NotificationProps) {
	const icons = {
		success: <CheckCircle className="h-5 w-5 text-green-600" />,
		error: <XCircle className="h-5 w-5 text-red-600" />,
		warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
	};

	const bgColors = {
		success: "bg-green-50 border-green-200",
		error: "bg-red-50 border-red-200",
		warning: "bg-yellow-50 border-yellow-200",
	};

	const textColors = {
		success: "text-green-800",
		error: "text-red-800",
		warning: "text-yellow-800",
	};

	return (
		<Card className={`${bgColors[type]} mb-4 border`}>
			<CardContent className="p-4">
				<div className="flex items-start gap-3">
					{icons[type]}
					<div className="flex-1">
						<h4 className={`font-medium ${textColors[type]}`}>{title}</h4>
						<p className={`mt-1 text-sm ${textColors[type]}`}>{message}</p>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={onDismiss}
						className="h-auto p-1"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

export function SubscriptionNotifications() {
	const searchParams = useSearchParams();
	const [notifications, setNotifications] = useState<
		Array<{
			id: string;
			type: "success" | "error" | "warning";
			title: string;
			message: string;
		}>
	>([]);

	useEffect(() => {
		const newNotifications: Array<{
			id: string;
			type: "success" | "error" | "warning";
			title: string;
			message: string;
		}> = [];

		// Check for upgrade success/failure
		if (searchParams.get("upgrade") === "success") {
			newNotifications.push({
				id: "upgrade-success",
				type: "success",
				title: "Subscription Updated",
				message:
					"Your subscription has been successfully updated. You now have access to your new plan features.",
			});
		} else if (searchParams.get("upgrade") === "canceled") {
			newNotifications.push({
				id: "upgrade-canceled",
				type: "warning",
				title: "Upgrade Canceled",
				message:
					"Your subscription upgrade was canceled. Your current plan remains unchanged.",
			});
		}

		// Check for cancellation success
		if (searchParams.get("canceled") === "true") {
			newNotifications.push({
				id: "cancel-success",
				type: "success",
				title: "Subscription Canceled",
				message:
					"Your subscription has been canceled and will end at the current billing period.",
			});
		}

		// Check for restoration success
		if (searchParams.get("restored") === "true") {
			newNotifications.push({
				id: "restore-success",
				type: "success",
				title: "Subscription Restored",
				message:
					"Your subscription has been successfully restored and will continue at the next billing cycle.",
			});
		}

		// Check for general subscription success
		if (searchParams.get("subscription") === "success") {
			newNotifications.push({
				id: "subscription-success",
				type: "success",
				title: "Subscription Active",
				message:
					"Welcome! Your subscription is now active and you have access to all premium features.",
			});
		}

		setNotifications(newNotifications);

		// Auto-dismiss success notifications after 10 seconds
		const timer = setTimeout(() => {
			setNotifications((prev) => prev.filter((n) => n.type !== "success"));
		}, 10000);

		return () => clearTimeout(timer);
	}, [searchParams]);

	const dismissNotification = (id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	if (notifications.length === 0) {
		return null;
	}

	return (
		<div className="mb-6">
			{notifications.map((notification) => (
				<Notification
					key={notification.id}
					type={notification.type}
					title={notification.title}
					message={notification.message}
					onDismiss={() => dismissNotification(notification.id)}
				/>
			))}
		</div>
	);
}
