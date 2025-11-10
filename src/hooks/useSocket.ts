import { socket } from '@/services/socket';
import { useEffect } from 'react';

export function useSocketEvent(event: string, callback: (data: any) => void) {
  useEffect(() => {
    socket.on(event, callback);

    return () => {
      socket.off(event, callback);
    };
  }, [event, callback]);
}

export function useSocket() {
  return socket;
}
