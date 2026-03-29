import { useState } from "react";
import React from "react";
import { useEffect, useRef } from "react";
import { BASE_URL } from "../../constants.js";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";

function StarField() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const stars = Array.from({ length: 80 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            length: Math.random() * 120 + 60,
            speed: Math.random() * 4 + 2,
            opacity: Math.random(),
            active: false,
            delay: Math.random() * 200,
        }));

        let frame = 0;
        let animId;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            frame++;

            stars.forEach((star) => {
                if (frame < star.delay) return;
                if (!star.active) star.active = true;

                star.x += star.speed;
                star.y += star.speed * 0.4;

                if (star.x > canvas.width || star.y > canvas.height) {
                    star.x = Math.random() * canvas.width * 0.6;
                    star.y = Math.random() * canvas.height * 0.4;
                    star.delay = frame + Math.random() * 100;
                    star.active = false;
                }

                const grad = ctx.createLinearGradient(
                    star.x, star.y,
                    star.x - star.length, star.y - star.length * 0.4
                );
                grad.addColorStop(0, `rgba(255,255,255,${star.opacity})`);
                grad.addColorStop(1, "rgba(255,255,255,0)");

                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(star.x - star.length, star.y - star.length * 0.4);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 1;
                ctx.stroke();
            });

            animId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animId);
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

function Auth() {
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useUser();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async () => {
        if (!form.email || !form.password) return setError("Please fill in all fields.");
        if (mode === "register" && !form.username) return setError("Username is required.");
        setLoading(true);
        try {
          const endpoint = mode === "login" ? "/api/users/signin" : "/api/users/signup";
          const body = mode === "login"
            ? { email: form.email, password: form.password }
            : { username: form.username, email: form.email, password: form.password };
          const res = await fetch(`${BASE_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(body),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Something went wrong.");
          setUser(data.user);
          navigate("/home");

        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center text-[#e8e8e8] relative overflow-hidden"
            style={{
                background: 'radial-gradient(ellipse at top, #111 0%, #0a0a0a 50%, #000 100%)',
            }}
        >
            {/* <StarField /> */}
            {/* Glow blob */}
            <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-10"
                style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%)' }}
            />
            <div className="relative z-10 w-full max-w-sm px-10 py-8 bg-[#141414] border border-[#222] rounded-xl">
                {/* Logo */}
                <div className="font-mono text-xl tracking-tight mb-9">notes</div>
                {/* Tabs */}
                <div className="flex border-b border-[#222] mb-8 ">
                    {["login", "register"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setMode(tab); setError(""); }}
                            className={`mr-6 pb-2.5 text-xs tracking-wide relative cursor-pointer font-dm   transition-colors duration-200 ${mode === tab
                                ? "text-[#e8e8e8] after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-px after:bg-[#e8e8e8]"
                                : "text-[#555] hover:text-[#888]"
                                }`}
                        >
                            {tab === "login" ? "sign in" : "register"}
                        </button>
                    ))}
                </div>

                {/* Fields */}
                {mode === "register" && (
                    <div className="mb-4">
                        <label className="block font-mono text-[10px] uppercase tracking-widest text-[#555] mb-2">username</label>
                        <input
                            name="username"
                            placeholder="your name"
                            value={form.username}
                            onChange={handleChange}
                            autoComplete="off"
                            className="w-full bg-[#0f0f0f] border border-[#222] rounded-md px-3.5 py-2.5 font-mono text-sm text-[#e8e8e8] placeholder-[#333] outline-none focus:border-[#444] transition-colors"
                        />
                    </div>
                )}

                <div className="mb-4">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-[#555] mb-2">email</label>
                    <input
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="off"
                        className="w-full bg-[#0f0f0f] border border-[#222] rounded-md px-3.5 py-2.5 font-mono text-sm text-[#e8e8e8] placeholder-[#333] outline-none focus:border-[#444] transition-colors"
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-mono text-[10px] uppercase tracking-widest text-[#555] mb-2">password</label>
                    <input
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full bg-[#0f0f0f] border border-[#222] rounded-md px-3.5 py-2.5 font-mono text-sm text-[#e8e8e8] placeholder-[#333] outline-none focus:border-[#444] transition-colors"
                    />
                </div>

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full mt-6 py-2.5 bg-[#e8e8e8]  cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-[#0f0f0f] text-sm font-medium rounded-md transition-colors duration-200 bg-white/90 hover:bg-white"
                >
                    {loading ? "please wait..." : mode === "login" ? "sign in" : "create account"}
                </button>

                {/* Error */}
                {error && (
                    <div className="mt-4 px-3.5 py-2.5 bg-[#1a1010] border border-[#3a1f1f] rounded-md font-mono text-xs text-[#e07070]">
                        {error}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-7 font-mono text-xs text-[#444] text-center">
                    {mode === "login" ? (
                        <>no account?{" "}
                            <span onClick={() => { setMode("register"); setError(""); }} className="text-[#888] hover:text-[#e8e8e8] underline underline-offset-2 cursor-pointer transition-colors">
                                register
                            </span>
                        </>
                    ) : (
                        <>already have one?{" "}
                            <span onClick={() => { setMode("login"); setError(""); }} className="text-[#888] hover:text-[#e8e8e8] underline underline-offset-2 cursor-pointer transition-colors">
                                sign in
                            </span>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
export default Auth;