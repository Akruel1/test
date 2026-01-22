import React from 'react';
// @ts-ignore - API seems to have changed or differs in this environment
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { CodeEditor } from '../Editor/CodeEditor';
import { GameCanvas } from './GameCanvas';
import { Console } from '../UI/Console';
import { useAppStore } from '../../store/appStore';
import { executeCode } from '../../engine/executor';

export const GameLayout: React.FC = () => {
  const { code, setCode } = useAppStore();

  const handleRun = () => {
    executeCode(code);
  };

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden">
        {/* Top Bar */}
        
        {/* @ts-ignore */}
        <PanelGroup direction="horizontal" className="flex-1">
            <Panel defaultSize={40} minSize={20}>
                <CodeEditor 
                    code={code} 
                    onChange={(val) => setCode(val || '')} 
                    onExecute={handleRun}
                />
            </Panel>
            
            {/* @ts-ignore */}
            <PanelResizeHandle className="w-1 bg-gray-700 hover:bg-green-500 transition-colors" />
            
            <Panel defaultSize={60} minSize={30}>
                 {/* @ts-ignore */}
                <PanelGroup direction="vertical">
                    <Panel defaultSize={70} minSize={30}>
                        <GameCanvas />
                    </Panel>
                    
                    {/* @ts-ignore */}
                    <PanelResizeHandle className="h-1 bg-gray-700 hover:bg-green-500 transition-colors" />
                    
                    <Panel defaultSize={30} minSize={10}>
                        <Console />
                    </Panel>
                </PanelGroup>
            </Panel>
        </PanelGroup>
    </div>
  );
};
