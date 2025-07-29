'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Reply, 
  Edit, 
  Trash2, 
  Send,
  User,
  MoreHorizontal
} from 'lucide-react';
import { datasetApi } from '@/api/dataset';
import { DatasetComment, DatasetCommentCreateRequest } from '@/types';

interface DatasetCommentsProps {
  datasetId: number;
}

/**
 * 数据集评论组件
 */
export default function DatasetComments({ datasetId }: DatasetCommentsProps) {
  const [comments, setComments] = useState<DatasetComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<DatasetComment | null>(null);
  const [editingComment, setEditingComment] = useState<DatasetComment | null>(null);
  const [editContent, setEditContent] = useState('');

  // 加载评论列表
  const LoadComments = async () => {
    setLoading(true);
    try {
      const response = await datasetApi.GetDatasetComments({
        datasetId,
        page: 1,
        size: 50,
      });
      setComments(response.data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  // 发表评论
  const HandleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const commentData: DatasetCommentCreateRequest = {
        datasetId,
        content: newComment.trim(),
        parentId: replyTo?.id,
        replyTo: replyTo?.username,
      };

      await datasetApi.CreateDatasetComment(commentData);
      setNewComment('');
      setReplyTo(null);
      LoadComments();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 更新评论
  const HandleUpdateComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    setSubmitting(true);
    try {
      await datasetApi.UpdateDatasetComment(commentId, {
        content: editContent.trim(),
      });
      setEditingComment(null);
      setEditContent('');
      LoadComments();
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 删除评论
  const HandleDeleteComment = async (commentId: number) => {
    if (!confirm('确定要删除这条评论吗？')) return;

    try {
      await datasetApi.DeleteDatasetComment(commentId);
      LoadComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  // 点赞/取消点赞
  const HandleToggleLike = async (commentId: number) => {
    try {
      await datasetApi.ToggleCommentLike(commentId);
      LoadComments();
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  // 格式化时间
  const FormatTime = (timeString?: string) => {
    if (!timeString) return '-';
    const date = new Date(timeString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  // 页面加载时获取评论
  useEffect(() => {
    LoadComments();
  }, [datasetId]);

  return (
    <div className="space-y-6">
      {/* 发表评论区域 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">发表评论</h3>
        
        {replyTo && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                回复 @{replyTo.username}
              </span>
              <button
                onClick={() => setReplyTo(null)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                取消回复
              </button>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="写下你的评论..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="text-sm text-gray-500">
                {newComment.length}/500
              </div>
              <button
                onClick={HandleSubmitComment}
                disabled={!newComment.trim() || submitting}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? '发送中...' : '发送'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 评论列表 */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            评论 ({comments.length})
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无评论</h3>
            <p className="text-gray-500">成为第一个发表评论的人</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {comment.username}
                        </span>
                        {comment.replyTo && (
                          <span className="text-sm text-gray-500">
                            回复 @{comment.replyTo}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {FormatTime(comment.createTime)}
                        </span>
                        <div className="relative">
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <MoreHorizontal className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {editingComment?.id === comment.id ? (
                      <div className="mt-3">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                        />
                        <div className="flex items-center justify-end space-x-2 mt-3">
                          <button
                            onClick={() => {
                              setEditingComment(null);
                              setEditContent('');
                            }}
                            className="px-3 py-1 text-gray-600 hover:text-gray-800"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => comment.id && HandleUpdateComment(comment.id)}
                            disabled={!editContent.trim() || submitting}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {submitting ? '保存中...' : '保存'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 mt-3">
                      <button
                        onClick={() => comment.id && HandleToggleLike(comment.id)}
                        className={`flex items-center space-x-1 text-sm ${
                          comment.isLiked 
                            ? 'text-red-600' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                        <span>{comment.likes}</span>
                      </button>
                      <button
                        onClick={() => setReplyTo(comment)}
                        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                      >
                        <Reply className="h-4 w-4" />
                        <span>回复</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingComment(comment);
                          setEditContent(comment.content);
                        }}
                        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                        <span>编辑</span>
                      </button>
                      <button
                        onClick={() => comment.id && HandleDeleteComment(comment.id)}
                        className="flex items-center space-x-1 text-sm text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>删除</span>
                      </button>
                    </div>

                    {/* 回复列表 */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="pl-4 border-l-2 border-gray-200">
                            <div className="flex space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                  <User className="h-3 w-3 text-white" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-900">
                                      {reply.username}
                                    </span>
                                    {reply.replyTo && (
                                      <span className="text-sm text-gray-500">
                                        回复 @{reply.replyTo}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {FormatTime(reply.createTime)}
                                  </span>
                                </div>
                                <p className="mt-1 text-gray-700">{reply.content}</p>
                                <div className="flex items-center space-x-4 mt-2">
                                  <button
                                    onClick={() => reply.id && HandleToggleLike(reply.id)}
                                    className={`flex items-center space-x-1 text-sm ${
                                      reply.isLiked 
                                        ? 'text-red-600' 
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                  >
                                    <Heart className={`h-3 w-3 ${reply.isLiked ? 'fill-current' : ''}`} />
                                    <span>{reply.likes}</span>
                                  </button>
                                  <button
                                    onClick={() => setReplyTo(reply)}
                                    className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                                  >
                                    <Reply className="h-3 w-3" />
                                    <span>回复</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 