'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bell, X, Check, ExternalLink } from 'lucide-react';

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLElement | null>;
}

export default function NotificationOverlay({ isOpen, onClose, anchorRef }: NotificationOverlayProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const overlayRef = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [isVisible, setIsVisible] = useState(false);

    // Effect to fetch data when the overlay is opened
    useEffect(() => {
        if (isOpen && session) {
            fetchNotifications();
        }
    }, [isOpen, session]);

    // Effect for the fade/scale animation
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [isOpen]);

    // Effect to calculate position based on the anchorRef (the bell icon)
    useEffect(() => {
        const calculatePosition = () => {
            if (isOpen && anchorRef.current && overlayRef.current) {
                const anchorRect = anchorRef.current.getBoundingClientRect();
                const overlayWidth = overlayRef.current.offsetWidth;
                const screenWidth = window.innerWidth;

                // Center the dropdown under the anchor
                let left = anchorRect.left + (anchorRect.width / 2) - (overlayWidth / 2);

                // Boundary checks to prevent screen overflow on mobile
                if (left < 16) {
                    left = 16; // Margin from left edge
                }
                if (left + overlayWidth > screenWidth - 16) {
                    left = screenWidth - overlayWidth - 16; // Margin from right edge
                }

                setPosition({
                    top: anchorRect.bottom + 12, // 12px below the icon
                    left: left,
                });
            }
        };

        calculatePosition(); // Calculate once on open
        window.addEventListener('resize', calculatePosition); // Recalculate on resize
        return () => window.removeEventListener('resize', calculatePosition);

    }, [isOpen, anchorRef, loading]); // `loading` helps recalculate if size changes

    // Effect to handle clicks outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                overlayRef.current &&
                !overlayRef.current.contains(event.target as Node) &&
                !anchorRef.current?.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, anchorRef]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.slice(0, 5));
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        setNotifications(prev =>
            prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
        try {
            await fetch('/api/notifications', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId }),
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className={`fixed z-50 bg-white rounded-lg shadow-xl border w-full max-w-sm sm:w-96 max-h-[500px] overflow-hidden flex flex-col transition-all duration-200 ease-in-out ${isVisible ? 'opacity-100 transform scale-100' : 'opacity-0 transform scale-95 pointer-events-none'}`}
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                maxWidth: 'calc(100vw - 32px)',
            }}
        >
            <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>}
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto flex-grow">
                {loading ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No new notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                            <div key={notification._id} className={`p-4 transition-colors hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}>
                                <div className="flex items-start space-x-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-gray-900 truncate">{notification.title}</h4>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            {!notification.isRead && (
                                                <button onClick={() => markAsRead(notification._id)} className="ml-2 p-1 text-blue-500 hover:text-blue-700" title="Mark as read">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {notifications.length > 0 && (
                <div className="p-2 border-t bg-gray-50 flex-shrink-0">
                    <button onClick={() => { onClose(); router.push('/notifications'); }} className="w-full flex items-center justify-center space-x-2 text-sm font-medium text-blue-600 hover:bg-blue-50 p-2 rounded-md transition-colors">
                        <span>View All Notifications</span>
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}