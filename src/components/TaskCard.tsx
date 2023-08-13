import { useState } from 'react';
import TrashIcon from '../icons/TrashIcon';
import { Id, Task } from '../types';
import './TaskCard.css';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

interface Props{
    task: Task;
    deleteTask: (id: Id) => void;
    updateTask: (id: Id, content: string) => void;
}
function TaskCard({task, deleteTask, updateTask}: Props){
    const [ isMouseOver, setIsMouseOver ] = useState(false);
    const  [editMode, setEditMode] = useState(false);

    const { setNodeRef, attributes, listeners, transition, transform, isDragging} = useSortable({
        id: task.id,
        data:{
            type: "Task",
            task
        },
        disabled: editMode,
    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    };

    const toggleEditMode = () => {
        setEditMode((prev) => !prev);
        setIsMouseOver(false);
    };
    if(isDragging){
        return <div
            ref={setNodeRef}
            style={style}
            className='task-content isDraggin'
            />
    }

    if(editMode){  
        return (
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className="task-content'"
            >
            <textarea
                className="textarea"
                value={task.content}
                autoFocus
                placeholder="Task content here"
                onBlur={toggleEditMode}
                onKeyDown={(e) => {
                if (e.key === "Enter" && e.shiftKey) {
                    toggleEditMode();
                    }
                }}
                onChange={(e) => updateTask(task.id, e.target.value)}
            ></textarea>
            </div>
        );
    }

    return (
    <div 
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={toggleEditMode}
        className='task-content'
        onMouseEnter={()=>{
            setIsMouseOver(true);
        }}
        onMouseLeave={()=>{
            setIsMouseOver(false)
        }}
        >
        <p className='task-content__area'>
            {task.content}
        </p>

        {isMouseOver && (
            <button 
                className='btn-task-trash' 
                onClick={()=>{
                    deleteTask(task.id);
                }}>
                    <TrashIcon />
            </button>)}
    </div>
        
    )
    
}

export default TaskCard;
