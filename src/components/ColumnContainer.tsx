import { SortableContext, useSortable } from "@dnd-kit/sortable";
import TrashIcon from "../icons/TrashIcon";
import { Column, Id, Task } from "../types";
import { CSS } from "@dnd-kit/utilities";
import "./ColumnContainer.css";
import { useMemo, useState } from "react";
import PlusIcon from "../icons/Plusicon";
import TaskCard from "./TaskCard";

interface Props {
  column: Column;
  deleteColumn: (id: Id) => void;
  updateColumn: (id: Id, title: string) => void;

  createTask: (columnId: Id) => void;
  deleteTask: (id: Id) => void;
  updateTask: (id: Id, content: string) => void;

  tasks: Task[];
}

function ColumnContainer(props: Props) {
  const {
    column,
    deleteColumn,
    updateColumn,
    createTask,
    tasks,
    deleteTask,
    updateTask,
  } = props;
  const [editMode, setEditMode] = useState(false);

  const tasksIds = useMemo(() => {
    return tasks.map((task) => task.id);
  }, [tasks]);

  const {
    setNodeRef,
    attributes,
    listeners,
    transition,
    transform,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
    disabled: editMode,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging) {
    return (
      <div ref={setNodeRef} style={style} className="column dragging"></div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="column">
      <div
        {...attributes}
        {...listeners}
        onClick={() => {
          setEditMode(true);
        }}
        className="column-title"
      >
        <div className="column-title__com">
          <div className="column-title__counter">{tasks.length}</div>
          {!editMode && column.title}
          {editMode && (
            <input
              value={column.title}
              onChange={(e) => updateColumn(column.id, e.target.value)}
              autoFocus
              onBlur={() => {
                setEditMode(false);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                setEditMode(false);
              }}
              className="input-edit"
            />
          )}
        </div>
        <button
          className="trash-icon-btn"
          onClick={() => {
            deleteColumn(column.id);
          }}
        >
          <TrashIcon />
        </button>
      </div>
      <div className="column-content">
        {tasks.map((task) => (
          <SortableContext items={tasksIds}>
            <TaskCard
              key={task.id}
              task={task}
              deleteTask={deleteTask}
              updateTask={updateTask}
            />
          </SortableContext>
        ))}
      </div>
      <button
        className="column-footer"
        onClick={() => {
          createTask(column.id);
        }}
      >
        <PlusIcon /> Add task
      </button>
    </div>
  );
}

export default ColumnContainer;
