"use client";

import React from 'react';
import { WORKERS, Worker } from '../constants';
import { useStartupStore } from '../store';
import { motion } from 'framer-motion';

interface RecruitModalProps {
    onClose: () => void;
}

const RecruitModal: React.FC<RecruitModalProps> = ({ onClose }) => {
    const { capital, performAction, workers } = useStartupStore();

    const handleHire = (worker: Worker) => {
        performAction('hire', worker);
        onClose();
    };

    // Filter out already hired workers
    const availableWorkers = WORKERS.filter(w => !workers.some(existing => existing.id === w.id));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gray-800 border border-gray-600 rounded-3xl p-6 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-black text-white">Recruit New Members</h2>
                    <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full w-10 h-10 flex items-center justify-center">
                        ✕
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableWorkers.map((worker) => (
                        <div key={worker.id} className="bg-gray-700 rounded-2xl p-4 border border-gray-600 flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="text-5xl bg-gray-600 rounded-full w-16 h-16 flex items-center justify-center">
                                    {worker.avatar}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">{worker.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded ${worker.role === 'Engineer' ? 'bg-blue-600' :
                                        worker.role === 'Marketer' ? 'bg-pink-600' : 'bg-purple-600'
                                        }`}>
                                        {worker.role}
                                    </span>
                                </div>
                            </div>

                            <div className="text-sm text-gray-300">
                                <div className="flex justify-between">
                                    <span>Skill:</span>
                                    <span className="font-bold text-yellow-400">+{worker.skill}</span>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span>Cost:</span>
                                    <span>{worker.cost} garu</span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleHire(worker)}
                                disabled={capital < worker.cost}
                                className="w-full py-2 rounded-xl font-bold bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:bg-gray-600 text-white transition-colors"
                            >
                                Hire (${worker.cost})
                            </button>
                        </div>
                    ))}

                    {availableWorkers.length === 0 && (
                        <p className="text-gray-400 col-span-full text-center py-8">
                            No more candidates available right now.
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default RecruitModal;
