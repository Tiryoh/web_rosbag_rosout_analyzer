import { useState } from 'react';
import { Upload, Filter, Download, BarChart3 } from 'lucide-react';
import type { RosoutMessage } from './types';
import { SEVERITY_NAMES, SEVERITY_COLORS, SEVERITY_BG_COLORS } from './types';
import {
  loadRosbagMessages,
  filterMessages,
  exportToCSV,
  exportToJSON,
  exportToTXT,
  downloadFile,
} from './rosbagUtils';

function App() {
  const [messages, setMessages] = useState<RosoutMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<RosoutMessage[]>([]);
  const [uniqueNodes, setUniqueNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Filter states
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [selectedSeverities, setSelectedSeverities] = useState<Set<number>>(new Set());
  const [keywords, setKeywords] = useState('');
  const [regexPattern, setRegexPattern] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [filterMode, setFilterMode] = useState<'OR' | 'AND'>('OR');
  const [showStats, setShowStats] = useState(false);
  const [timezone, setTimezone] = useState<'local' | 'utc'>('local');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('=== File upload started ===');
    console.log('Selected file:', file.name);

    setLoading(true);
    setError('');

    try {
      console.log('Calling loadRosbagMessages...');
      const { messages: loadedMessages, uniqueNodes: nodes } = await loadRosbagMessages(file);
      console.log('loadRosbagMessages completed successfully');
      console.log('Messages loaded:', loadedMessages.length);
      console.log('Unique nodes:', nodes.size);

      setMessages(loadedMessages);
      setFilteredMessages(loadedMessages);
      setUniqueNodes(nodes);
      setSelectedNodes(new Set());
      setSelectedSeverities(new Set());
      console.log('State updated successfully');
    } catch (err) {
      console.error('Error in handleFileUpload:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bag file';
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('=== File upload completed ===');
    }
  };

  const applyFilters = () => {
    const filtered = filterMessages(messages, {
      nodeNames: selectedNodes.size > 0 ? selectedNodes : undefined,
      severityLevels: selectedSeverities.size > 0 ? selectedSeverities : undefined,
      messageKeywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
      messageRegex: useRegex ? regexPattern : undefined,
      filterMode,
      useRegex,
    });
    setFilteredMessages(filtered);
  };

  const handleExport = (format: 'csv' | 'json' | 'txt') => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    let content: string;
    let filename: string;
    let type: string;

    switch (format) {
      case 'csv':
        content = exportToCSV(filteredMessages, timezone);
        filename = `rosout_export_${timestamp}.csv`;
        type = 'text/csv';
        break;
      case 'json':
        content = exportToJSON(filteredMessages, timezone);
        filename = `rosout_export_${timestamp}.json`;
        type = 'application/json';
        break;
      case 'txt':
        content = exportToTXT(filteredMessages, timezone);
        filename = `rosout_export_${timestamp}.txt`;
        type = 'text/plain';
        break;
    }

    downloadFile(content, filename, type);
  };

  const toggleNode = (node: string) => {
    const newSet = new Set(selectedNodes);
    if (newSet.has(node)) {
      newSet.delete(node);
    } else {
      newSet.add(node);
    }
    setSelectedNodes(newSet);
  };

  const toggleSeverity = (severity: number) => {
    const newSet = new Set(selectedSeverities);
    if (newSet.has(severity)) {
      newSet.delete(severity);
    } else {
      newSet.add(severity);
    }
    setSelectedSeverities(newSet);
  };

  const getStatistics = () => {
    const severityCount: Record<number, number> = {};
    const nodeCount: Record<string, number> = {};

    filteredMessages.forEach(msg => {
      severityCount[msg.severity] = (severityCount[msg.severity] || 0) + 1;
      nodeCount[msg.node] = (nodeCount[msg.node] || 0) + 1;
    });

    const topNodes = Object.entries(nodeCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return { severityCount, topNodes };
  };

  const stats = getStatistics();

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    if (timezone === 'utc') {
      return date.toISOString().replace('T', ' ').substring(0, 23) + ' UTC';
    } else {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      const ms = String(date.getMilliseconds()).padStart(3, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            🎯 rosbag rosout/rosout_agg Analyzer
          </h1>
            <p className="text-gray-600 dark:text-gray-300">
            Browser-based tool for analyzing ROS log messages - No installation required!<br />
            <span className="text-green-700 dark:text-green-400 font-semibold">
              All processing is done locally in your browser, no data is sent externally.
            </span>
            </p>
        </div>

        {/* File Upload */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">ROSbag file (.bag)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".bag"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </label>

          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Loading bag file...</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Error loading bag file:</p>
              <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap overflow-x-auto">{error}</pre>
            </div>
          )}

          {messages.length > 0 && (
            <div className="mt-4 text-center">
              <p className="text-green-600 dark:text-green-400 font-semibold">
                ✓ Loaded {messages.length.toLocaleString()} messages from {uniqueNodes.size} nodes
              </p>
            </div>
          )}
        </div>

        {/* Filters */}
        {messages.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <Filter className="w-5 h-5 mr-2 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Filter Mode */}
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter Mode
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filterMode === 'OR'}
                      onChange={() => setFilterMode('OR')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      OR (Any match)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filterMode === 'AND'}
                      onChange={() => setFilterMode('AND')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      AND (All match)
                    </span>
                  </label>
                </div>
              </div>

              {/* Severity Levels */}
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Severity Levels
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(SEVERITY_NAMES).map(([level, name]) => (
                    <button
                      key={level}
                      onClick={() => toggleSeverity(Number(level))}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        selectedSeverities.has(Number(level))
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nodes */}
              <div className="text-left">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nodes ({uniqueNodes.size})
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedNodes(new Set(uniqueNodes))}
                      className="text-xs px-2 py-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                    >
                      select all
                    </button>
                    <button
                      onClick={() => setSelectedNodes(new Set())}
                      className="text-xs px-2 py-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                    >
                      clear
                    </button>
                  </div>
                </div>
                <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2">
                  {Array.from(uniqueNodes)
                    .sort()
                    .map(node => (
                      <label key={node} className="flex items-center py-1">
                        <input
                          type="checkbox"
                          checked={selectedNodes.has(node)}
                          onChange={() => toggleNode(node)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{node}</span>
                      </label>
                    ))}
                </div>
              </div>

              {/* Message Filter Type */}
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message Filter Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!useRegex}
                      onChange={() => setUseRegex(false)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Keywords</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={useRegex}
                      onChange={() => setUseRegex(true)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Regex</span>
                  </label>
                </div>
              </div>

              {/* Keywords or Regex */}
              <div className="md:col-span-2 text-left">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {useRegex ? 'Regular Expression Pattern' : 'Keywords (comma-separated)'}
                </label>
                <input
                  type="text"
                  value={useRegex ? regexPattern : keywords}
                  onChange={e => (useRegex ? setRegexPattern(e.target.value) : setKeywords(e.target.value))}
                  placeholder={
                    useRegex ? 'e.g., error.*timeout|connection.*failed' : 'e.g., error, timeout, connection'
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  setSelectedNodes(new Set());
                  setSelectedSeverities(new Set());
                  setKeywords('');
                  setRegexPattern('');
                  setFilteredMessages(messages);
                }}
                className="px-6 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md font-medium transition-colors"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium transition-colors flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                {showStats ? 'Hide Stats' : 'Show Stats'}
              </button>
            </div>
          </div>
        )}

        {/* Statistics */}
        {showStats && filteredMessages.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  By Severity
                </h3>
                {Object.entries(stats.severityCount).map(([level, count]) => {
                  const percentage = ((count / filteredMessages.length) * 100).toFixed(1);
                  return (
                    <div key={level} className="flex justify-between items-center py-1">
                      <span className={`font-medium ${SEVERITY_COLORS[Number(level)]}`}>
                        {SEVERITY_NAMES[Number(level)]}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {count} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Top 5 Nodes
                </h3>
                {stats.topNodes.map(([node, count]) => {
                  const percentage = ((count / filteredMessages.length) * 100).toFixed(1);
                  return (
                    <div key={node} className="flex justify-between items-center py-1">
                      <span className="text-gray-700 dark:text-gray-300 truncate flex-1">
                        {node}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-2">
                        {count} ({percentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Export */}
        {filteredMessages.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Export</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredMessages.length.toLocaleString()} messages ready to export
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleExport('csv')}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  JSON
                </button>
                <button
                  onClick={() => handleExport('txt')}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  TXT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages Table */}
        {filteredMessages.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Messages ({filteredMessages.length.toLocaleString()})
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Timezone:</span>
                <button
                  onClick={() => setTimezone(timezone === 'local' ? 'utc' : 'local')}
                  className="px-3 py-1 text-sm font-medium rounded-md transition-colors bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {timezone === 'local' ? 'Local' : 'UTC'}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Node
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Message
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredMessages.slice(0, 100).map((msg, idx) => {
                    return (
                      <tr key={idx} className={SEVERITY_BG_COLORS[msg.severity]}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {formatTime(msg.timestamp)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {msg.node}
                        </td>
                        <td className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${SEVERITY_COLORS[msg.severity]}`}>
                          {SEVERITY_NAMES[msg.severity]}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                          {msg.message}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredMessages.length > 100 && (
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 text-center text-sm text-gray-500 dark:text-gray-400">
                Showing first 100 of {filteredMessages.length.toLocaleString()} messages
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
