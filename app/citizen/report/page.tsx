"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    MapPin,
    Upload,
    Camera,
    AlertCircle,
    Mic,
    MicOff,
    Play,
    Pause,
    Trash2,
    Download,
    Shield,
} from "lucide-react";
import MapPicker, { MapPickerValue } from "@/components/map-picker";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";

interface Department {
    id: string;
    name: string;
    email: string;
    description?: string;
    created_at: string;
}

interface FormData {
    title: string;
    description: string;
    category: string;
    priority: string;
    location_address: string;
    location_lat: string;
    location_lng: string;
    image_url: string;
    audio_url: string;
    landmark?: string;
    file?: File;
}

export default function ReportIssuePage() {
    const [formData, setFormData] = useState<FormData>({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        location_address: "",
        location_lat: "",
        location_lng: "",
        image_url: "",
        audio_url: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [descriptionMode, setDescriptionMode] = useState<"text" | "audio">(
        "text"
    );
    const [departments, setDepartments] = useState<Department[]>([]);

    // Speech-to-text (Web Speech API) state
    const [supportsSpeech, setSupportsSpeech] = useState(false);
    const [transcribeEnabled, setTranscribeEnabled] = useState(true);
    const [recognizing, setRecognizing] = useState(false);
    const [speechLang, setSpeechLang] = useState<string>(
        typeof navigator !== "undefined" && navigator.language
            ? navigator.language
            : "en-US"
    );
    const [transcript, setTranscript] = useState<string>("");
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const { toast } = useToast();
    const router = useRouter();
    const { user } = useAuth();
    const supabase = createClient();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (user === null) {
            router.push("/citizen/login");
        }
    }, [user, router]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            if (audioRef.current) {
                audioRef.current.pause();
            }
            // Stop speech recognition if active
            try {
                recognitionRef.current?.stop?.();
            } catch {}
        };
    }, []);

    // Detect Web Speech API support
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SR =
                (window as any).SpeechRecognition ||
                (window as any).webkitSpeechRecognition;
            setSupportsSpeech(!!SR);
        }
    }, []);

    // Fetch departments for category selection
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch("/api/departments");
                if (response.ok) {
                    const data = await response.json();
                    if (data.departments && Array.isArray(data.departments)) {
                        setDepartments(data.departments);
                    }
                }
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };

        fetchDepartments();
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = async (file: File) => {
        if (!user) {
            toast({
                title: "Authentication required",
                description: "Please sign in to upload images",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        try {
            const form = new FormData();
            form.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: form,
                credentials: "include",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to upload file");

            // Save both uploaded URL and File object for Gemini
            setFormData((prev) => ({ ...prev, image_url: data.url, file }));

            toast({
                title: "Success",
                description: "Image uploaded successfully",
            });
        } catch (error: any) {
            console.error("Upload error:", error);
            toast({
                title: "Upload failed",
                description:
                    error.message ||
                    "Failed to upload image. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    // Audio recording functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            const chunks: BlobPart[] = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/webm" });
                setAudioBlob(blob);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

            // Start speech recognition if enabled
            if (supportsSpeech && transcribeEnabled) {
                startTranscription();
            }
        } catch (error) {
            console.error("Error starting recording:", error);
            toast({
                title: "Recording failed",
                description:
                    "Could not access microphone. Please check permissions.",
                variant: "destructive",
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
                recordingIntervalRef.current = null;
            }
            // Stop speech recognition
            if (supportsSpeech) {
                stopTranscription();
            }
        }
    };

    // Start Web Speech API transcription
    const startTranscription = () => {
        try {
            const SR =
                (window as any).SpeechRecognition ||
                (window as any).webkitSpeechRecognition;
            if (!SR) return;
            const recognition = new SR();
            recognition.lang = speechLang || "en-US";
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = (event: any) => {
                let finalText = "";
                let interimText = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const res = event.results[i];
                    if (res.isFinal) {
                        finalText += res[0].transcript + " ";
                    } else {
                        interimText += res[0].transcript + " ";
                    }
                }
                const combined = [transcript, finalText, interimText]
                    .filter(Boolean)
                    .join(" ")
                    .trim();
                setTranscript(combined);
            };
            recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
                console.warn("Speech recognition error:", e);
            };
            recognition.onend = () => {
                setRecognizing(false);
                // Auto-restart during recording if enabled
                if (isRecording && transcribeEnabled) {
                    try {
                        recognition.start();
                        setRecognizing(true);
                    } catch (error) {
                        console.warn('Failed to restart recognition:', error);
                    }
                }
            };
            recognition.start();
            recognitionRef.current = recognition;
            setRecognizing(true);
        } catch (err) {
            console.warn("Failed to start speech recognition:", err);
        }
    };

    const stopTranscription = () => {
        try {
            recognitionRef.current?.stop?.();
        } catch {}
        recognitionRef.current = null;
        setRecognizing(false);
    };

    // Keep form description in sync with transcript while in audio mode
    useEffect(() => {
        if (descriptionMode === "audio" && transcribeEnabled) {
            setFormData((prev) => ({ ...prev, description: transcript }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transcript, descriptionMode, transcribeEnabled]);

    const playAudio = () => {
        if (audioBlob && !isPlaying) {
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
                setIsPlaying(false);
                URL.revokeObjectURL(audioUrl);
            };

            audio.play();
            setIsPlaying(true);
        } else if (audioRef.current && isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const deleteRecording = () => {
        setAudioBlob(null);
        setRecordingTime(0);
        setFormData((prev) => ({ ...prev, audio_url: "" }));
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData((prev) => ({
                        ...prev,
                        location_lat: position.coords.latitude.toString(),
                        location_lng: position.coords.longitude.toString(),
                    }));
                    toast({
                        title: "Location detected",
                        description:
                            "Your current location has been added to the issue.",
                    });
                },
                (error) => {
                    toast({
                        title: "Location access denied",
                        description: "Please enter your location manually.",
                        variant: "destructive",
                    });
                }
            );
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Convert file to base64 if exists
            let imageBase64: string | null = null;
            if (formData.file) {
                const reader = new FileReader();
                imageBase64 = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(formData.file as File);
                });
            }

            // Gemini verification
            const effectiveDescription =
                descriptionMode === "audio" && transcribeEnabled && transcript
                    ? transcript
                    : formData.description;

            const verifyRes = await fetch("/api/verify-issue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    category: formData.category,
                    description: effectiveDescription,
                    imageBase64,
                }),
            });

            if (!verifyRes.ok) throw new Error("Verification request failed");
            const { decision, category: verifiedCategory } =
                await verifyRes.json();

            console.log("=== GEMINI VERIFICATION LOG ===");
            console.log("Title:", formData.title);
            console.log("Category (Original):", formData.category);
            console.log("Category (Verified):", verifiedCategory);
            console.log("Description:", formData.description);
            console.log("Has Image:", !!formData.file);
            console.log("Gemini Decision:", decision);
            console.log("=================================");

            if (decision !== "Yes") {
                toast({
                    title: "Verification Failed",
                    description:
                        "Your report did not pass AI verification. Please ensure it is a legitimate civic issue.",
                    variant: "destructive",
                });
                setIsSubmitting(false);
                return;
            }

            // Upload audio if there's a recording but no audio_url yet
            // Use verified category from Gemini
            let finalFormData = {
                ...formData,
                category: verifiedCategory || formData.category,
                description: effectiveDescription,
            };

            if (audioBlob && !formData.audio_url) {
                try {
                    // Convert blob to file
                    const audioFile = new File(
                        [audioBlob],
                        `audio-${Date.now()}.webm`,
                        { type: "audio/webm" }
                    );

                    // Upload to Supabase storage
                    const fileName = `${user?.id}/${Date.now()}-${
                        audioFile.name
                    }`;

                    const { data, error } = await supabase.storage
                        .from("audio")
                        .upload(fileName, audioFile, {
                            cacheControl: "3600",
                            upsert: false,
                        });

                    if (error) {
                        console.error("Supabase storage upload error:", error);
                        throw error;
                    }

                    // Get public URL
                    const {
                        data: { publicUrl },
                    } = supabase.storage.from("audio").getPublicUrl(fileName);

                    finalFormData.audio_url = publicUrl;
                } catch (audioError: any) {
                    console.error("Audio upload error:", audioError);
                    const errorMessage = audioError?.message || "Unknown error";
                    toast({
                        title: "Audio upload failed",
                        description: `Failed to upload audio: ${errorMessage}. Submitting without audio.`,
                        variant: "destructive",
                    });
                }
            }

            // Submit issue to backend
            const response = await fetch("/api/issues", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(finalFormData),
            });

            const responseText = await response.text();
            const data = responseText ? JSON.parse(responseText) : {};

            if (response.ok) {
                toast({
                    title: "Issue reported successfully",
                    description:
                        "Your issue has been submitted and will be reviewed by our team.",
                });

                // Reset form
                setFormData({
                    title: "",
                    description: "",
                    category: "",
                    priority: "medium",
                    location_address: "",
                    location_lat: "",
                    location_lng: "",
                    image_url: "",
                    audio_url: "",
                });
                setAudioBlob(null);
                setRecordingTime(0);

                setTimeout(() => router.push("/citizen/dashboard"), 1500);
            } else {
                console.error("API error response:", data);
                throw new Error(data.error || "Failed to submit issue");
            }
        } catch (error: any) {
            console.error("Error during submission:", error);
            toast({
                title: "Submission failed",
                description:
                    error.message ||
                    "Failed to submit issue. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="responsive-container py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="responsive-heading-1 mb-2">
                            Report an Issue
                        </h1>
                        <p className="responsive-body text-muted-foreground">
                            Help improve your community by reporting issues that
                            need attention
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Issue Details</CardTitle>
                            <CardDescription>
                                Provide as much detail as possible to help us
                                address the issue quickly
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="responsive-form">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Issue Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="Brief description of the issue"
                                        value={formData.title}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "title",
                                                e.target.value
                                            )
                                        }
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label>Description * (Text or Audio)</Label>
                                    <Tabs
                                        value={descriptionMode}
                                        onValueChange={(value) =>
                                            setDescriptionMode(
                                                value as "text" | "audio"
                                            )
                                        }
                                        className="w-full"
                                    >
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="text">
                                                Type Description
                                            </TabsTrigger>
                                            <TabsTrigger value="audio">
                                                Record Audio
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent
                                            value="text"
                                            className="space-y-2"
                                        >
                                            <Textarea
                                                id="description"
                                                placeholder="Provide detailed information about the issue..."
                                                value={formData.description}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                                rows={4}
                                            />
                                        </TabsContent>

                                        <TabsContent
                                            value="audio"
                                            className="space-y-4"
                                        >
                                            <div className="border rounded-lg p-4 space-y-4">
                                                {supportsSpeech ? (
                                                    <div className="flex flex-col gap-3 rounded-md border p-3 bg-muted/30">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Shield className="w-4 h-4 text-blue-600" />
                                                                <span className="text-sm font-medium">
                                                                    Auto-transcribe
                                                                    speech
                                                                    (free)
                                                                </span>
                                                            </div>
                                                            <Switch
                                                                checked={
                                                                    transcribeEnabled
                                                                }
                                                                onCheckedChange={(
                                                                    v
                                                                ) => {
                                                                    setTranscribeEnabled(
                                                                        !!v
                                                                    );
                                                                    if (!v) {
                                                                        stopTranscription();
                                                                    } else if (
                                                                        isRecording
                                                                    ) {
                                                                        startTranscription();
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">
                                                                    Language
                                                                </Label>
                                                                <Select
                                                                    value={
                                                                        speechLang
                                                                    }
                                                                    onValueChange={(
                                                                        v
                                                                    ) => {
                                                                        setSpeechLang(
                                                                            v
                                                                        );
                                                                        if (
                                                                            recognizing
                                                                        ) {
                                                                            stopTranscription();
                                                                            startTranscription();
                                                                        }
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="h-8">
                                                                        <SelectValue placeholder="Select language" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="en-US">
                                                                            English
                                                                            (US)
                                                                        </SelectItem>
                                                                        <SelectItem value="en-GB">
                                                                            English
                                                                            (UK)
                                                                        </SelectItem>
                                                                        <SelectItem value="hi-IN">
                                                                            Hindi
                                                                            (India)
                                                                        </SelectItem>
                                                                        <SelectItem value="bn-IN">
                                                                            Bengali
                                                                            (India)
                                                                        </SelectItem>
                                                                        <SelectItem value="ta-IN">
                                                                            Tamil
                                                                            (India)
                                                                        </SelectItem>
                                                                        <SelectItem value="te-IN">
                                                                            Telugu
                                                                            (India)
                                                                        </SelectItem>
                                                                        <SelectItem value="mr-IN">
                                                                            Marathi
                                                                            (India)
                                                                        </SelectItem>
                                                                        <SelectItem value="gu-IN">
                                                                            Gujarati
                                                                            (India)
                                                                        </SelectItem>
                                                                        <SelectItem value="pa-IN">
                                                                            Punjabi
                                                                            (India)
                                                                        </SelectItem>
                                                                        <SelectItem value="ur-PK">
                                                                            Urdu
                                                                            (Pakistan)
                                                                        </SelectItem>
                                                                        <SelectItem value="es-ES">
                                                                            Spanish
                                                                            (Spain)
                                                                        </SelectItem>
                                                                        <SelectItem value="fr-FR">
                                                                            French
                                                                            (France)
                                                                        </SelectItem>
                                                                        <SelectItem value="de-DE">
                                                                            German
                                                                            (Germany)
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs">
                                                                    Status
                                                                </Label>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {transcribeEnabled
                                                                        ? recognizing
                                                                            ? "Listening…"
                                                                            : isRecording
                                                                            ? "Ready"
                                                                            : "Idle"
                                                                        : "Disabled"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-xs">
                                                                Transcript
                                                                (editable)
                                                            </Label>
                                                            <Textarea
                                                                value={
                                                                    transcript
                                                                }
                                                                onChange={(e) =>
                                                                    setTranscript(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                rows={4}
                                                                placeholder="Live transcript will appear here…"
                                                            />
                                                            <p className="text-xs text-muted-foreground">
                                                                The transcript
                                                                will be sent as
                                                                your description
                                                                when submitting.
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="rounded-md border p-3 bg-muted/30 text-xs text-muted-foreground">
                                                        Your browser does not
                                                        support free speech
                                                        transcription. You can
                                                        still record audio and
                                                        type a description
                                                        manually.
                                                    </div>
                                                )}
                                                {!audioBlob ? (
                                                    <div className="text-center space-y-4">
                                                        <div className="flex flex-col items-center space-y-2">
                                                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                                                <Mic className="w-8 h-8 text-orange-600" />
                                                            </div>
                                                            <p className="text-sm text-muted-foreground">
                                                                Record your
                                                                voice to
                                                                describe the
                                                                issue
                                                            </p>
                                                        </div>

                                                        {!isRecording ? (
                                                            <Button
                                                                type="button"
                                                                onClick={
                                                                    startRecording
                                                                }
                                                                className="bg-red-500 hover:bg-red-600 text-white"
                                                            >
                                                                <Mic className="w-4 h-4 mr-2" />
                                                                Start Recording
                                                            </Button>
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-center space-x-2">
                                                                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                                                    <span className="text-lg font-mono">
                                                                        {formatTime(
                                                                            recordingTime
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    onClick={
                                                                        stopRecording
                                                                    }
                                                                    variant="outline"
                                                                >
                                                                    <MicOff className="w-4 h-4 mr-2" />
                                                                    Stop
                                                                    Recording
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                                    <Mic className="w-5 h-5 text-green-600" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-green-800">
                                                                        Recording
                                                                        Complete
                                                                    </p>
                                                                    <p className="text-sm text-green-600">
                                                                        Duration:{" "}
                                                                        {formatTime(
                                                                            recordingTime
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={
                                                                        playAudio
                                                                    }
                                                                >
                                                                    {isPlaying ? (
                                                                        <Pause className="w-4 h-4" />
                                                                    ) : (
                                                                        <Play className="w-4 h-4" />
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={
                                                                        deleteRecording
                                                                    }
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm text-blue-600 justify-center">
                                                            <Mic className="h-4 w-4" />
                                                            Audio will be
                                                            uploaded when you
                                                            submit the report
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Tip: Speak clearly and describe
                                                the issue in detail. You can
                                                play back your recording before
                                                uploading.
                                            </p>
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                {/* Category and Priority */}
                                <div className="responsive-form-row">
                                    <div className="responsive-form-field space-y-2">
                                        <Label htmlFor="category">
                                            Category *
                                        </Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(v) =>
                                                handleInputChange("category", v)
                                            }
                                        >
                                            <SelectTrigger className="responsive-focus">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {departments.map((dept) => (
                                                    <SelectItem
                                                        key={dept.id}
                                                        value={dept.name}
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <Shield className="w-4 h-4 text-blue-600" />
                                                            <span>
                                                                {dept.name}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="responsive-form-field space-y-2">
                                        <Label htmlFor="priority">
                                            Priority
                                        </Label>
                                        <Select
                                            value={formData.priority}
                                            onValueChange={(value) =>
                                                handleInputChange(
                                                    "priority",
                                                    value
                                                )
                                            }
                                        >
                                            <SelectTrigger className="responsive-focus">
                                                <SelectValue placeholder="Select priority" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">
                                                    Low
                                                </SelectItem>
                                                <SelectItem value="medium">
                                                    Medium
                                                </SelectItem>
                                                <SelectItem value="high">
                                                    High
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Location (Required) with Google Maps */}
                                <div className="space-y-2">
                                    <Label>Location *</Label>
                                    <MapPicker
                                        value={{
                                            address: formData.location_address,
                                            lat: formData.location_lat
                                                ? parseFloat(
                                                      formData.location_lat
                                                  )
                                                : null,
                                            lng: formData.location_lng
                                                ? parseFloat(
                                                      formData.location_lng
                                                  )
                                                : null,
                                        }}
                                        onChange={(val: MapPickerValue) => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                location_address: val.address,
                                                location_lat:
                                                    val.lat !== null
                                                        ? String(val.lat)
                                                        : "",
                                                location_lng:
                                                    val.lng !== null
                                                        ? String(val.lng)
                                                        : "",
                                            }));
                                        }}
                                        height={260}
                                    />

                                    <div className="space-y-1">
                                        <Label className="text-xs">
                                            Selected address
                                        </Label>
                                        <Input
                                            value={formData.location_address}
                                            readOnly
                                            className="text-xs"
                                        />
                                        {(!formData.location_lat ||
                                            !formData.location_lng) && (
                                            <p className="text-xs text-red-500 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                Please click on the map to set a
                                                location
                                            </p>
                                        )}
                                    </div>

                                    {/* Optional Landmark */}
                                    <div className="space-y-2">
                                        <Label htmlFor="landmark">
                                            Landmark (optional)
                                        </Label>
                                        <Input
                                            id="landmark"
                                            placeholder="Nearby landmark (optional)"
                                            value={
                                                (formData as any).landmark || ""
                                            }
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    landmark: e.target.value,
                                                }))
                                            }
                                        />
                                    </div>

                                    <div className="text-xs text-muted-foreground">
                                        Use the search box or click on the map
                                        to set the exact location.
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-2">
                                    <Label>Photo (Optional)</Label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file =
                                                    e.target.files?.[0];
                                                if (file)
                                                    handleFileUpload(file);
                                            }}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                                        >
                                            <Camera className="h-4 w-4" />
                                            {isUploading
                                                ? "Uploading..."
                                                : "Upload Photo"}
                                        </label>
                                        {formData.image_url && (
                                            <div className="flex items-center gap-2 text-sm text-green-600">
                                                <Upload className="h-4 w-4" />
                                                Image uploaded
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => router.back()}
                                        className="responsive-button flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={
                                            isSubmitting ||
                                            !formData.title ||
                                            (!formData.description &&
                                                !audioBlob) ||
                                            !formData.category ||
                                            !(
                                                formData.location_lat &&
                                                formData.location_lng
                                            )
                                        }
                                        className="responsive-button flex-1"
                                    >
                                        {isSubmitting
                                            ? "Submitting..."
                                            : "Submit Issue"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Help Text */}
                    <Card className="mt-6">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                                <div className="text-sm text-muted-foreground">
                                    <p className="font-medium mb-1">
                                        Tips for better issue reports:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>
                                            Be specific about the location and
                                            nature of the issue
                                        </li>
                                        <li>
                                            Include photos when possible to help
                                            with identification
                                        </li>
                                        <li>
                                            Use audio recording to provide
                                            detailed descriptions when typing is
                                            inconvenient
                                        </li>
                                        <li>
                                            Provide accurate contact information
                                            for follow-up
                                        </li>
                                        <li>
                                            Check if similar issues have already
                                            been reported
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
