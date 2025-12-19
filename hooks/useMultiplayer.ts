
import { useState, useEffect, useCallback, useRef } from 'react';
import { MultiplayerState } from '../types';
import Peer, { DataConnection } from 'peerjs';

const PEER_PREFIX = 'lux-2048-v3-'; // Version v3 pour éviter les collisions avec les anciennes sessions

export const useMultiplayer = (score: number, gameOver: boolean) => {
  const [mpState, setMpState] = useState<MultiplayerState>({
    roomCode: null,
    status: 'idle',
    isHost: false,
    opponentScore: 0,
    opponentReady: false,
    localReady: false,
    winner: null,
    error: null,
  });

  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const localReadyRef = useRef(false);

  // Mettre à jour la ref quand l'état change
  useEffect(() => {
    localReadyRef.current = mpState.localReady;
  }, [mpState.localReady]);

  const sendMessage = useCallback((type: string, payload: any = {}) => {
    if (connRef.current && connRef.current.open) {
      connRef.current.send({ type, payload });
    }
  }, []);

  const resetMp = useCallback(() => {
    if (connRef.current) connRef.current.close();
    if (peerRef.current) peerRef.current.destroy();
    connRef.current = null;
    peerRef.current = null;
    setMpState({
      roomCode: null,
      status: 'idle',
      isHost: false,
      opponentScore: 0,
      opponentReady: false,
      localReady: false,
      winner: null,
      error: null,
    });
  }, []);

  const handleData = useCallback((data: any) => {
    if (!data || typeof data !== 'object') return;
    const { type, payload } = data;
    
    switch (type) {
      case 'HELLO':
        // Le host reçoit HELLO et répond WELCOME
        sendMessage('WELCOME', { ready: localReadyRef.current });
        setMpState(prev => ({ ...prev, status: 'waiting' }));
        break;
      case 'WELCOME':
        // Le client reçoit WELCOME et confirme la connexion
        setMpState(prev => ({ 
          ...prev, 
          status: 'waiting', 
          opponentReady: payload.ready 
        }));
        break;
      case 'PLAYER_READY':
        setMpState(prev => ({ ...prev, opponentReady: payload.ready }));
        break;
      case 'SCORE_UPDATE':
        setMpState(prev => ({ ...prev, opponentScore: payload.score }));
        break;
      case 'I_LOST':
        setMpState(prev => ({ ...prev, status: 'ended', winner: 'local' }));
        break;
      case 'START_COUNTDOWN':
        setMpState(prev => ({ ...prev, status: 'countdown' }));
        break;
      case 'HEARTBEAT':
        // On peut ignorer, sert juste à garder la connexion active
        break;
    }
  }, [sendMessage]);

  const setupConnection = useCallback((conn: DataConnection) => {
    connRef.current = conn;

    conn.on('open', () => {
      console.log("Connection opened");
      // Si on est le client, on initie le handshake
      conn.send({ type: 'HELLO' });
    });

    conn.on('data', (data) => handleData(data));

    conn.on('close', () => {
      setMpState(prev => ({ 
        ...prev, 
        error: "Le rival s'est déconnecté.", 
        status: 'idle' 
      }));
    });

    conn.on('error', (err) => {
      console.error("Connection error:", err);
      setMpState(prev => ({ ...prev, error: "Erreur de transmission", status: 'idle' }));
    });
  }, [handleData]);

  const createRoom = () => {
    resetMp();
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const peer = new Peer(PEER_PREFIX + code);
    peerRef.current = peer;

    peer.on('open', (id) => {
      console.log('My peer ID is: ' + id);
      setMpState(prev => ({ ...prev, roomCode: code, isHost: true, status: 'waiting' }));
    });

    peer.on('connection', (conn) => {
      console.log("Incoming connection...");
      setupConnection(conn);
    });

    peer.on('error', (err) => {
      console.error("Peer error:", err.type);
      if (err.type === 'unavailable-id') {
        setMpState(prev => ({ ...prev, error: "Code déjà utilisé. Réessayez." }));
      } else {
        setMpState(prev => ({ ...prev, error: "Erreur réseau (Serveur PeerJS)" }));
      }
    });
  };

  const joinRoom = (code: string) => {
    if (!code || code.length < 4) return;
    resetMp();
    setMpState(prev => ({ ...prev, roomCode: code, isHost: false, status: 'searching', error: null }));

    const peer = new Peer();
    peerRef.current = peer;

    peer.on('open', () => {
      const conn = peer.connect(PEER_PREFIX + code, { reliable: true });
      setupConnection(conn);
    });

    peer.on('error', (err) => {
      console.error("Join Peer error:", err.type);
      let errorMsg = "Erreur de connexion.";
      if (err.type === 'peer-unavailable') {
        errorMsg = "Salon introuvable. Vérifiez le code.";
      } else if (err.type === 'network') {
        errorMsg = "Vérifiez votre connexion internet.";
      }
      setMpState(prev => ({ ...prev, error: errorMsg, status: 'idle' }));
    });
  };

  const setReady = () => {
    setMpState(prev => ({ ...prev, localReady: true }));
    sendMessage('PLAYER_READY', { ready: true });
  };

  // Keep-alive heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      if (connRef.current?.open) {
        sendMessage('HEARTBEAT');
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [sendMessage]);

  // Sync scores
  useEffect(() => {
    if (mpState.status === 'playing') {
      sendMessage('SCORE_UPDATE', { score });
    }
  }, [score, mpState.status, sendMessage]);

  // Sync loss
  useEffect(() => {
    if (gameOver && mpState.status === 'playing') {
      setMpState(prev => ({ ...prev, status: 'ended', winner: 'opponent' }));
      sendMessage('I_LOST');
    }
  }, [gameOver, mpState.status, sendMessage]);

  // Logic to start countdown
  useEffect(() => {
    if (mpState.localReady && mpState.opponentReady && mpState.status === 'waiting') {
      if (mpState.isHost) {
        sendMessage('START_COUNTDOWN');
        setMpState(prev => ({ ...prev, status: 'countdown' }));
      }
    }
  }, [mpState.localReady, mpState.opponentReady, mpState.status, mpState.isHost, sendMessage]);

  const startGame = () => setMpState(prev => ({ ...prev, status: 'playing' }));

  return { mpState, createRoom, joinRoom, setReady, startGame, resetMp };
};
