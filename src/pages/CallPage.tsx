import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

export default function CallPage() {
  const { appointmentId } = useParams();
  const roomId = useMemo(() => appointmentId || "room", [appointmentId]);

  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [users, setUsers] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        setStatus("connecting");
        const token = localStorage.getItem("medflow_token");
        if (!token) throw new Error("Not authenticated");

        const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = localStream;
        if (localRef.current) localRef.current.srcObject = localStream;

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
        });
        pcRef.current = pc;

        for (const track of localStream.getTracks()) {
          pc.addTrack(track, localStream);
        }

        pc.ontrack = (e) => {
          const [stream] = e.streams;
          if (remoteRef.current) remoteRef.current.srcObject = stream;
        };

        const socket = io(API_URL, { auth: { token } });
        socketRef.current = socket;

        socket.on("connect_error", (e: any) => {
          if (cancelled) return;
          setError(e?.message || "Socket connection failed");
          setStatus("error");
        });

        socket.on("room:users", ({ count }: { count: number }) => setUsers(count));

        socket.on("room:ready", async () => {
          // Only one side should create the offer. We pick the side that has no remote track yet.
          if (!pcRef.current) return;
          if (pcRef.current.signalingState !== "stable") return;
          const offer = await pcRef.current.createOffer();
          await pcRef.current.setLocalDescription(offer);
          socket.emit("signal:offer", { roomId, sdp: offer });
        });

        socket.on("signal:offer", async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
          if (!pcRef.current) return;
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          socket.emit("signal:answer", { roomId, sdp: answer });
        });

        socket.on("signal:answer", async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
          if (!pcRef.current) return;
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
          setStatus("connected");
        });

        socket.on("signal:ice", async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
          if (!pcRef.current) return;
          if (candidate) await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        });

        pc.onicecandidate = (e) => {
          if (e.candidate) socket.emit("signal:ice", { roomId, candidate: e.candidate.toJSON() });
        };

        socket.emit("join", { roomId });

        if (!cancelled) setStatus("connected");
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Failed to start call");
        setStatus("error");
      }
    }

    start();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [roomId]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Telemedicine Call</h1>
            <p className="text-sm text-muted-foreground">
              Room: <span className="font-mono">{roomId}</span> • Users: {users} • Status: {status}
            </p>
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
          <Button asChild variant="outline">
            <Link to="..">Back</Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="p-3 border-b border-border text-sm text-muted-foreground">You</div>
            <video ref={localRef} autoPlay playsInline muted className="w-full aspect-video bg-black" />
          </div>
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="p-3 border-b border-border text-sm text-muted-foreground">Remote</div>
            <video ref={remoteRef} autoPlay playsInline className="w-full aspect-video bg-black" />
          </div>
        </div>
      </div>
    </div>
  );
}

