import React from 'react'


import { Users, UserMinus, FilePlus, Trash2, PlusCircle } from "lucide-react";

const icons = {
    join:   <Users size={12} className="text-emerald-400" strokeWidth={1.8} />,
    leave:  <UserMinus size={12} className="text-white/30" strokeWidth={1.8} />,
    note:   <FilePlus size={12} className="text-sky-400" strokeWidth={1.8} />,
    add:    <PlusCircle size={12} className="text-violet-400" strokeWidth={1.8} />,
    delete: <Trash2 size={12} className="text-red-400/70" strokeWidth={1.8} />,
    info:   null,
};
function ToastContainer({ toasts }) {
    return (
        <>
            <div className="fixed top-13 right-0 z-[100] flex flex-col gap-2 items-end">
                {toasts.map(({ id, message, type }) => (
                    <div
                        key={id}
                        className="flex items-center gap-2.5 px-3.5 py-2.5
                               bg-[#111113] border border-white/8
                               rounded-xl shadow-2xl
                               animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                        {icons[type]}
                        <span className="text-xs text-white/50 font-medium">
                            {message}
                        </span>
                    </div>
                ))}
            </div>
        </>
    )
}

export default ToastContainer