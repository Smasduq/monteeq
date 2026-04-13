import React, { useState, useRef } from 'react';
import { Mic, Square, Send, Trash2 } from 'lucide-react';

const VoiceRecorder = ({ onSendVoice }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef(null);
    const timerRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const chunks = [];

            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Camera/Mic access denied", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSend = () => {
        if (audioBlob) {
            onSendVoice(audioBlob);
            setAudioBlob(null);
            setRecordingTime(0);
        }
    };

    const handleDiscard = () => {
        setAudioBlob(null);
        setRecordingTime(0);
    };

    return (
        <div className="voice-recorder-overlay">
            {!isRecording && !audioBlob ? (
                <button className="record-btn" onClick={startRecording}>
                    <Mic size={20} />
                </button>
            ) : isRecording ? (
                <div className="recording-status">
                    <span className="rec-indicator"></span>
                    <span className="time">{formatTime(recordingTime)}</span>
                    <button className="stop-btn" onClick={stopRecording}>
                        <Square size={20} fill="white" />
                    </button>
                </div>
            ) : (
                <div className="review-status">
                    <button className="discard-btn" onClick={handleDiscard}>
                        <Trash2 size={20} />
                    </button>
                    <span className="time">{formatTime(recordingTime)} (Recorded)</span>
                    <button className="send-voice-btn" onClick={handleSend}>
                        <Send size={20} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default VoiceRecorder;
