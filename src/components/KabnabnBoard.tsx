import { useMemo, useState } from 'react';
import PlusIcon from '../icons/Plusicon';
import { Column, Id, Task } from '../types';
import ColumnContainer from './ColumnContainer';
import { DndContext,DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor,useSensor, useSensors, } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import './KanbanBoard.css';
import { createPortal } from 'react-dom';
import TaskCard from './TaskCard';

function KanbanBoard () {
    const [columns, setColumns]=useState<Column[]>([]);
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    const [tasks, setTasks] = useState<Task[]>([]);

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 4
            },
        })
    );

    return(
        <div className='kanboard-container'>
            <button className="add-btn" onClick={createNewColumn}><PlusIcon /> Add List</button>

            <DndContext 
                sensors={sensors} 
                onDragStart={onDragStart} 
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
                >
                <div className='column-container'>
                    <div className='column-card'>
                        <SortableContext items={columnsId}>

                            {columns.map((col) => (
                                <ColumnContainer 
                                    key={col.id} 
                                    column={col} 
                                    deleteColumn={deleteColumn}
                                    updateColumn={updateColumn}
                                    createTask={createTask}
                                    tasks={tasks.filter ((task) => task.columnId === col.id)}
                                    deleteTask={deleteTask}
                                    updateTask={updateTask}
                                    />
                                ))}
                        </SortableContext>
                    </div>
                </div>
                {createPortal(
                <DragOverlay>
                    {activeColumn && (
                        <ColumnContainer 
                            column={activeColumn}
                            deleteColumn={deleteColumn}
                            updateColumn={updateColumn}
                            createTask={createTask}
                            tasks={tasks.filter ((task) => task.columnId === activeColumn.id)}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                        />
                    )}
                    {activeTask && (
                        <TaskCard 
                            task={activeTask} 
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                            />
                    )}
                </DragOverlay>, document.body
                )}
            </DndContext>

        </div>
    );

    function createTask(columnId: Id){
        const newTask:Task = {
            id: generateId(),
            columnId,
            content: `Task ${tasks.length + 1}`
        };
        setTasks([...tasks, newTask]);
    }
    function deleteTask(id: Id){
        const newTasks = tasks.filter((task) => task.id !== id);
        setTasks(newTasks);
    }
    function updateTask(id: Id, content:string){
        const newTasks = tasks.map((task) => {
            if(task.id !== id) return task;
            return {...task, content};
        })
        setTasks(newTasks);
    }
    
    function createNewColumn(){
        const columnToAdd: Column = {
            id: generateId(),
            title: `Column ${columns.length + 1}`
        };

        setColumns([...columns, columnToAdd]);
    }
    function deleteColumn(id: Id){
        const filteredColumns = columns.filter((col) => col.id !== id);
        setColumns(filteredColumns);

        const newTask = tasks.filter((t) => t.columnId !== id);
        setTasks(newTask)
    }
    function updateColumn(id: Id, title: string){
        const newColumns = columns.map((col)=>{
            if(col.id !== id ) return col;
            return {...col, title}
        });
        setColumns(newColumns);
    }
    function onDragOver(event: DragOverEvent){
        const {active, over} = event;
        if(!over) return;

        const activeId = active.id;
        const overId = over.id;

        if(activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        if(!isActiveTask) return;

        if(isActiveTask && isOverTask){
            setTasks(tasks => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t)=> t.id === overId);
                
                tasks[activeIndex].columnId = tasks[overIndex].columnId

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        const isOverColumn = over.data.current?.type === "Column";

        if(isActiveTask && isOverColumn){
            setTasks(tasks => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                
                tasks[activeIndex].columnId = overId;

                return arrayMove(tasks, activeIndex, activeIndex);
            });
        }

    }
    function onDragStart(event: DragStartEvent) {
        if(event.active.data.current?.type === "Column"){
            setActiveColumn(event.active.data.current.column);
            return;
        }
        if(event.active.data.current?.type === "Task"){
            setActiveTask(event.active.data.current.task);
            return;
        }
    }
    function onDragEnd(event: DragEndEvent){
        setActiveColumn(null);
        setActiveTask(null);

        const {active, over} = event;
        if(!over) return;

        const activeColumnId = active.id;
        const overColumnId = over.id;

        if(activeColumnId === overColumnId) return;

        setColumns(columns => {
            const activeColumnsIndex = columns.findIndex((col) => col.id === activeColumnId);

            const overColumnIndex = columns.findIndex((col) => col.id === overColumnId);

            return arrayMove(columns, activeColumnsIndex, overColumnIndex);
        })
    }
}

function generateId(){
    return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;