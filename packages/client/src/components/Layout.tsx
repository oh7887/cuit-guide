import React, { useState } from 'react';
import { MessageSquare, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Separator } from './ui/separator';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer';

/**
 * 主布局组件 - 使用 shadcn 组件实现三栏布局
 * 左侧：可折叠的二级菜单（聊天记录 + 智能体市场，各自可独立折叠）
 * 中间：聊天页面
 * 右侧：MCP 设置按钮（使用 shadcn Drawer 组件）
 */
export const Layout: React.FC = () => {
  // 左侧面板整体展开/折叠状态
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  // 聊天记录列表展开/折叠状态
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(true);
  // 智能体市场列表展开/折叠状态
  const [isAgentMarketOpen, setIsAgentMarketOpen] = useState(true);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* 左侧栏 - 可折叠 */}
      <div className={`${isLeftPanelOpen ? 'w-80' : 'w-16'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}>
        {/* 左侧栏顶部 - 切换按钮 */}
        <div className="p-4 border-b border-gray-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsLeftPanelOpen(!isLeftPanelOpen)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
        
        {/* 左侧栏内容 - 只在展开时显示 */}
        {isLeftPanelOpen && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 聊天记录折叠组件 */}
            <Collapsible open={isChatHistoryOpen} onOpenChange={setIsChatHistoryOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto font-medium">
                  聊天记录
                  {isChatHistoryOpen ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-3">
                <Card>
                  <CardContent className="p-3">
                    <p className="text-sm text-gray-500">暂无聊天记录</p>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* 智能体市场折叠组件 */}
            <Collapsible open={isAgentMarketOpen} onOpenChange={setIsAgentMarketOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto font-medium">
                  智能体市场
                  {isAgentMarketOpen ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-3">
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-3">
                    <p className="font-medium text-sm">Claude Sonnet 4</p>
                    <p className="text-xs text-gray-500">强大的通用 AI 助手</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-3">
                    <p className="font-medium text-sm">GPT-4</p>
                    <p className="text-xs text-gray-500">OpenAI 的先进语言模型</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardContent className="p-3">
                    <p className="font-medium text-sm">MCP Agent</p>
                    <p className="text-xs text-gray-500">支持工具调用的智能助手</p>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </div>

      {/* 中间聊天区域 */}
      <div className="flex-1 flex flex-col">
        {/* 聊天消息区域 */}
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">需要什么帮助？</h2>
            <p className="text-gray-500">请在下方输入您的问题</p>
          </div>
        </div>
        
        {/* 输入框区域 */}
        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="请输入问题或需求"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button>发送</Button>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧 MCP 设置按钮和 Drawer */}
      <div className="absolute top-4 right-4">
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              title="MCP 设置"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="h-full w-96">
            <DrawerHeader>
              <div className="flex items-center justify-between">
                <DrawerTitle>MCP 服务器</DrawerTitle>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon">
                    ✕
                  </Button>
                </DrawerClose>
              </div>
              <DrawerDescription>
                管理和配置 Model Context Protocol 服务器连接
              </DrawerDescription>
            </DrawerHeader>

            {/* MCP 服务器列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">文件系统 MCP</h3>
                  <p className="text-sm text-gray-500 mb-2">本地文件操作</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-xs text-gray-500">未连接</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-1">网络搜索 MCP</h3>
                  <p className="text-sm text-gray-500 mb-2">网页搜索功能</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-xs text-gray-500">未连接</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};
