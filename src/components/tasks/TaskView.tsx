/**
 * Диспетчер заданий: рендерит компонент по типу задания.
 */
import type { Task } from '../../engine/types';
import { QuizTask } from './QuizTask';
import { BuildPromptTask } from './BuildPromptTask';
import { FindBugTask } from './FindBugTask';
import { ChatSimTask } from './ChatSimTask';
import { TerminalSimTask } from './TerminalSimTask';
import { RealMissionTask } from './RealMissionTask';

interface TaskViewProps {
  task: Task;
  onSolved: (mistakes: number) => void;
}

export function TaskView({ task, onSolved }: TaskViewProps) {
  switch (task.type) {
    case 'quiz':
      return <QuizTask task={task} onSolved={onSolved} />;
    case 'build-prompt':
      return <BuildPromptTask task={task} onSolved={onSolved} />;
    case 'find-bug':
      return <FindBugTask task={task} onSolved={onSolved} />;
    case 'chat-sim':
      return <ChatSimTask task={task} onSolved={onSolved} />;
    case 'terminal-sim':
      return <TerminalSimTask task={task} onSolved={onSolved} />;
    case 'real-mission':
      return <RealMissionTask task={task} onSolved={onSolved} />;
    default:
      return null;
  }
}
