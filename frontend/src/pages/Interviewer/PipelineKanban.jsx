import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CheckCircle, XCircle, FileText, User as UserIcon } from 'lucide-react';
import axiosInstance from '../../utils/axiosInstance';
import { Toaster, toast } from 'react-hot-toast';

const STAGES = ['Applied', 'Screened', 'Technical', 'HR', 'Offer'];

const PipelineKanban = ({ applicants, jobId, onUpdateStatus, setPreviewResumeUrl }) => {
    const [columns, setColumns] = useState({});
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);
    const [offerForm, setOfferForm] = useState({
        compensation: '',
        currency: 'USD',
        deadline: ''
    });

    useEffect(() => {
        // Group applicants by stage
        const initialColumns = STAGES.reduce((acc, stage) => {
            acc[stage] = [];
            return acc;
        }, {});

        applicants.forEach(app => {
            // Default to 'Applied' if stage is not set
            const stage = STAGES.includes(app.stage) ? app.stage : 'Applied';
            if (initialColumns[stage]) {
                initialColumns[stage].push(app);
            }
        });

        setColumns(initialColumns);
    }, [applicants]);

    const onDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;

        if (source.droppableId !== destination.droppableId) {
            const sourceColumn = [...columns[source.droppableId]];
            const destColumn = [...columns[destination.droppableId]];
            const [removed] = sourceColumn.splice(source.index, 1);
            
            // Optimistic UI update
            const updatedRemoved = { ...removed, stage: destination.droppableId };
            destColumn.splice(destination.index, 0, updatedRemoved);

            setColumns({
                ...columns,
                [source.droppableId]: sourceColumn,
                [destination.droppableId]: destColumn
            });

            // Update Backend
            try {
                await axiosInstance.put(`/api/applications/${draggableId}/stage`, {
                    stage: destination.droppableId
                });
                toast.success(`Moved to ${destination.droppableId}`);
            } catch (err) {
                console.error("Failed to update stage", err);
                toast.error("Failed to update stage. Reverting...");
                // Revert is complex here without full refetch, a simple page reload or refetch is easier if needed
                // Realistically, we'd trigger a re-fetch from parent
            }
        } else {
            // Reordering within the same column
            const column = [...columns[source.droppableId]];
            const [removed] = column.splice(source.index, 1);
            column.splice(destination.index, 0, removed);

            setColumns({
                ...columns,
                [source.droppableId]: column
            });
        }
    };

    const handleOfferDetailsSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.put(`/api/applications/${selectedApp.id}/offer-details`, offerForm);
            toast.success("Offer details updated!");
            setShowOfferModal(false);
            // Parent will refetch
            if (onUpdateStatus) onUpdateStatus(selectedApp.id, 'approved'); // Trigger a refresh indirectly
        } catch (err) {
            toast.error("Failed to update offer details");
        }
    };

    const getStageColor = (stage) => {
        switch(stage) {
            case 'Applied': return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
            case 'Screened': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
            case 'Technical': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
            case 'HR': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800';
            case 'Offer': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
            default: return 'bg-gray-100';
        }
    };

    return (
        <div className="w-full overflow-x-auto pb-4">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-4 min-w-[1200px]">
                    {STAGES.map((stage) => (
                        <div key={stage} className={`flex-1 rounded-2xl border p-4 ${getStageColor(stage)} flex flex-col min-h-[500px]`}>
                            <h3 className="font-bold mb-4 flex justify-between items-center text-gray-800 dark:text-gray-200">
                                <span>{stage}</span>
                                <span className="bg-white/50 dark:bg-black/50 px-2 py-0.5 rounded-full text-xs">
                                    {columns[stage]?.length || 0}
                                </span>
                            </h3>
                            
                            <Droppable droppableId={stage}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 flex flex-col gap-3 rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-black/5' : ''}`}
                                    >
                                        {columns[stage]?.map((app, index) => (
                                            <Draggable key={app.id || app._id} draggableId={app.id || app._id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`bg-white dark:bg-black/60 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-white/10 ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500 scale-105' : ''} transition-all`}
                                                        style={{...provided.draggableProps.style}}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex gap-2 items-center">
                                                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                                    {app.candidate?.name?.[0] || 'C'}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-sm dark:text-white truncate max-w-[120px]">
                                                                        {app.candidate?.name}
                                                                    </div>
                                                                    {app.is_screened && (
                                                                         <div className={`text-[10px] font-bold flex items-center gap-1 ${app.ai_score >= 80 ? 'text-green-600' : app.ai_score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                                                                            <CheckCircle size={10} /> {app.ai_score}% Match
                                                                         </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button 
                                                                onClick={() => setPreviewResumeUrl(app.resume_url)}
                                                                className="text-gray-400 hover:text-blue-500 transition-colors bg-gray-50 dark:bg-white/5 p-1.5 rounded-lg"
                                                                title="View Resume"
                                                            >
                                                                <FileText size={14} />
                                                            </button>
                                                        </div>
                                                        
                                                        {app.status === 'pending' ? (
                                                            <div className="flex gap-2 mt-3 pt-3 border-t dark:border-white/10">
                                                                <button
                                                                    onClick={() => onUpdateStatus(app.id, 'approved')}
                                                                    className="flex-1 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 rounded-lg text-[10px] font-bold transition-colors"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => onUpdateStatus(app.id, 'rejected')}
                                                                    className="flex-1 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-lg text-[10px] font-bold transition-colors"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className={`mt-3 pt-2 border-t dark:border-white/10 text-[10px] font-bold uppercase tracking-wider text-center ${app.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                                                {app.status}
                                                            </div>
                                                        )}

                                                        {stage === 'Offer' && (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedApp(app);
                                                                    setOfferForm({
                                                                        compensation: app.offer_details?.compensation || '',
                                                                        currency: app.offer_details?.currency || 'USD',
                                                                        deadline: app.offer_details?.deadline ? new Date(app.offer_details.deadline).toISOString().split('T')[0] : ''
                                                                    });
                                                                    setShowOfferModal(true);
                                                                }}
                                                                className="w-full mt-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 transition-colors"
                                                            >
                                                                Set Offer Details
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            {/* Offer Details Modal */}
            {showOfferModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-3xl w-full max-w-md p-8 border dark:border-white/10 shadow-2xl">
                        <h3 className="text-xl font-bold mb-6 dark:text-white">Offer Details for {selectedApp?.candidate?.name}</h3>
                        <form onSubmit={handleOfferDetailsSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Compensation Amount</label>
                                <input 
                                    type="number" 
                                    required
                                    value={offerForm.compensation}
                                    onChange={(e) => setOfferForm({...offerForm, compensation: e.target.value})}
                                    className="w-full px-4 py-2 rounded-xl border dark:bg-white/5 dark:border-white/10 dark:text-white"
                                    placeholder="e.g. 120000"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Currency</label>
                                <select 
                                    className="w-full px-4 py-2 rounded-xl border dark:bg-white/5 dark:border-white/10 dark:text-white"
                                    value={offerForm.currency}
                                    onChange={(e) => setOfferForm({...offerForm, currency: e.target.value})}
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="GBP">GBP</option>
                                    <option value="INR">INR</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Offer Deadline</label>
                                <input 
                                    type="date" 
                                    required
                                    value={offerForm.deadline}
                                    onChange={(e) => setOfferForm({...offerForm, deadline: e.target.value})}
                                    className="w-full px-4 py-2 rounded-xl border dark:bg-white/5 dark:border-white/10 dark:text-white"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowOfferModal(false)} className="flex-1 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-bold">Save Offer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PipelineKanban;
