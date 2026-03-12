import { useState } from 'react';
import { Plus, Check, Trash2, Tag } from 'lucide-react';
import { useTasks, type Task } from '@/hooks/use-tasks';
import { motion, AnimatePresence } from 'framer-motion';

export function TaskPlanner() {
  const { tasks, addTask, toggleTask, deleteTask, clearCompleted } = useTasks();
  const [text, setText] = useState('');
  const [subject, setSubject] = useState('');
  
  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask(text, subject);
    setText('');
    // Keep subject for next task, easier entry
  };

  return (
    <div className="w-full max-w-xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium tracking-tight text-foreground">Action Plan</h2>
        {completedTasks.length > 0 && (
          <button 
            onClick={clearCompleted}
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear completed
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full pl-11 pr-4 py-3.5 bg-card border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm group-hover:border-border"
            />
          </div>
          <div className="relative w-full sm:w-1/3 group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Tag className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Subject (opt)"
              className="w-full pl-11 pr-4 py-3.5 bg-card border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm group-hover:border-border"
            />
          </div>
          <button
            type="submit"
            disabled={!text.trim()}
            className="hidden sm:block px-6 py-3.5 bg-foreground text-background font-medium rounded-xl hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            Add
          </button>
        </div>
      </form>

      <div className="space-y-6">
        {tasks.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-card/30">
            <p className="text-muted-foreground">Your planner is empty. Add a task to begin.</p>
          </div>
        ) : (
          <>
            <TaskList items={activeTasks} onToggle={toggleTask} onDelete={deleteTask} />
            
            {completedTasks.length > 0 && (
              <div className="pt-4 opacity-60 hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                  Completed ({completedTasks.length})
                </h3>
                <TaskList items={completedTasks} onToggle={toggleTask} onDelete={deleteTask} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TaskList({ items, onToggle, onDelete }: { 
  items: Task[], 
  onToggle: (id: string) => void, 
  onDelete: (id: string) => void 
}) {
  if (items.length === 0) return null;

  return (
    <ul className="space-y-3">
      <AnimatePresence initial={false}>
        {items.map(task => (
          <motion.li
            key={task.id}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`
              group flex items-center gap-4 p-4 rounded-xl transition-all duration-300
              ${task.completed ? 'bg-card/50 border border-transparent' : 'bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30'}
            `}
          >
            <button
              onClick={() => onToggle(task.id)}
              className={`
                flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                ${task.completed 
                  ? 'bg-primary border-primary text-primary-foreground' 
                  : 'border-muted-foreground/30 hover:border-primary text-transparent'
                }
              `}
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            
            <div className="flex-1 min-w-0">
              <p className={`
                text-base truncate transition-all duration-300
                ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground font-medium'}
              `}>
                {task.text}
              </p>
            </div>
            
            {task.subject && (
              <span className={`
                flex-shrink-0 px-2.5 py-1 text-xs font-medium rounded-md transition-colors
                ${task.completed ? 'bg-background text-muted-foreground/50' : 'bg-primary/10 text-primary'}
              `}>
                {task.subject}
              </span>
            )}

            <button
              onClick={() => onDelete(task.id)}
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all rounded-lg hover:bg-destructive/10 focus:opacity-100"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
