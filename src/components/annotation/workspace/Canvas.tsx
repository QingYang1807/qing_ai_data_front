import React from 'react';
import { AnnotationType, Annotation } from '@/types/annotation';
import { Result, Spin, message } from 'antd';

// Enhanced Sub-Editors with dummy interactivity
const ImageEditor: React.FC<{ src: string, tool: string }> = ({ src, tool }) => {
    const handleImageClick = (e: React.MouseEvent) => {
        if (tool === 'select') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        message.success(`Created ${tool.toUpperCase()} at (${Math.round(x)}, ${Math.round(y)})`);
    };

    return (
        <div className="relative w-full h-full bg-gray-900 flex items-center justify-center overflow-hidden cursor-crosshair group select-none">
            <div className="relative shadow-2xl" onClick={handleImageClick}>
                <img src={src || "https://via.placeholder.com/800x600"} alt="Target" className="max-w-[80vw] max-h-[80vh] object-contain pointer-events-none" />
                <div className="absolute top-[20%] left-[30%] w-[200px] h-[150px] border-2 border-green-500 bg-green-500 bg-opacity-20 flex flex-col pointer-events-auto hover:bg-opacity-30 transition-all z-10"
                    onClick={(e) => { e.stopPropagation(); message.info('Selected: Car'); }}>
                    <span className="bg-green-500 text-white text-xs px-1 self-start">Car (0.98)</span>
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-green-500"></div>
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-green-500"></div>
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-green-500"></div>
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-green-500"></div>
                </div>
                <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                    Current Tool: <span className="font-bold text-yellow-400">{tool.toUpperCase()}</span>
                </div>
            </div>
        </div>
    );
};

const TextEditor: React.FC<{ content: any }> = ({ content }) => (
    <div className="w-full h-full bg-gray-100 flex justify-center overflow-auto p-8">
        <div className="w-full max-w-3xl bg-white shadow-lg p-10 min-h-[600px] text-lg leading-relaxed font-serif text-gray-800 selection:bg-yellow-200">
            <h2 className="text-2xl font-bold mb-4 font-sans text-gray-900">Document Analysis Task</h2>
            <div className="prose max-w-none">
                <p className="mb-4">
                    The <span className="bg-blue-100 border-b-2 border-blue-400 px-1 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                        onClick={() => message.info('Selected Entity: United Nations')} title="Entity: Organization">United Nations</span> reported that global temperatures have risen by
                    <span className="bg-red-100 border-b-2 border-red-400 px-1 mx-1 rounded cursor-pointer hover:bg-red-200 transition-colors"
                        onClick={() => message.info('Selected Entity: 1.5 degrees')} title="Entity: Measurement">1.5 degrees Celsius</span>.
                </p>
                <p>Scientists warn that immediate action is required to mitigate the effects of climate change.</p>
            </div>
            <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded text-sm text-gray-500 font-sans">
                <p>Select text to annotate. Current mode: <strong>NER</strong></p>
            </div>
        </div>
    </div>
);

const AudioEditor: React.FC<{ src: string }> = ({ src }) => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-8">
        <div className="w-full max-w-4xl h-48 bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden border border-gray-700"
            onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = ((e.clientX - rect.left) / rect.width) * 100;
                message.success(`Set playhead at ${Math.round(percent)}%`);
            }}>
            <div className="absolute inset-0 flex items-center justify-around opacity-60 px-4 pointer-events-none">
                {Array.from({ length: 60 }).map((_, i) => (
                    <div key={i} className="w-1.5 bg-blue-500 rounded-sm" style={{ height: `${20 + Math.random() * 80}%` }}></div>
                ))}
            </div>
            <div className="absolute left-[20%] w-[15%] h-full bg-yellow-500 bg-opacity-20 border-l-2 border-r-2 border-yellow-500 flex items-start justify-center top-0 cursor-move"
                onClick={(e) => { e.stopPropagation(); message.info('Selected Region: Speech'); }}>
                <span className="bg-yellow-500 text-black text-xs font-bold px-1 rounded-b shadow-sm">Speech</span>
            </div>
            <div className="absolute left-[35%] w-0.5 h-full bg-red-500 shadow-glow pointer-events-none"></div>
        </div>
        <div className="mt-6 w-full max-w-xl bg-gray-800 p-4 rounded-xl flex items-center space-x-4 shadow-lg border border-gray-700">
            <button className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shadow-md active:scale-95" onClick={() => message.info('Playing...')}>▶</button>
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden cursor-pointer relative"><div className="absolute w-1/3 h-full bg-blue-500"></div></div>
            <span className="text-xs text-gray-400 font-mono">00:12 / 03:45</span>
        </div>
    </div>
);

const VideoEditor: React.FC<{ src: string }> = ({ src }) => (
    <div className="w-full h-full flex flex-col bg-gray-900 p-4">
        <div className="flex-1 relative bg-black rounded-lg overflow-hidden flex items-center justify-center group">
            {/* Mock Video content */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-6xl font-bold select-none opacity-20">VIDEO</div>
            <div className="relative w-[300px] h-[200px] border-2 border-dashed border-yellow-400 bg-yellow-400 bg-opacity-10 cursor-move flex items-center justify-center"
                onClick={() => message.info('Tracking Object: Person')}>
                <span className="text-yellow-400 font-mono text-xs bg-black px-1 absolute -top-5 left-0">ID: 12 (Person)</span>
            </div>

            {/* Overlay Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="bg-white text-black px-4 py-1 rounded-full text-sm font-bold shadow hover:bg-gray-200">Play</button>
                <button className="bg-white text-black px-4 py-1 rounded-full text-sm font-bold shadow hover:bg-gray-200">Next Frame</button>
            </div>
        </div>

        {/* Keyframe Timeline */}
        <div className="h-24 mt-4 bg-gray-800 rounded-lg border border-gray-700 relative overflow-hidden"
            onClick={(e) => message.success('Seeked to keyframe')}>
            <div className="absolute top-0 bottom-0 left-[20%] w-0.5 bg-red-500 z-10"></div>
            <div className="flex items-end h-full px-2 pb-2 space-x-1">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className={`flex-1 rounded-sm ${i % 5 === 0 ? 'bg-blue-500 h-8' : 'bg-gray-600 h-4'}`}></div>
                ))}
            </div>
            {/* Segments */}
            <div className="absolute top-2 left-[10%] w-[15%] h-4 bg-green-500 rounded opacity-60" title="Action: Walking"></div>
            <div className="absolute top-2 left-[40%] w-[10%] h-4 bg-purple-500 rounded opacity-60" title="Action: Running"></div>
        </div>
    </div>
);

const CodeEditor: React.FC<{ content: string }> = ({ content }) => {
    const codeLines = [
        "function calculateMetrics(data) {",
        "  // TODO: Optimize this loop",
        "  const result = [];",
        "  for (let i = 0; i < data.length; i++) {",
        "    if (data[i].value > threshold) {",
        "      result.push(data[i]);",
        "    }",
        "  }",
        "  return result;",
        "}"
    ];

    return (
        <div className="w-full h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono p-4 overflow-auto flex">
            {/* Line Numbers */}
            <div className="w-12 text-right pr-4 text-[#858585] select-none">
                {codeLines.map((_, i) => (
                    <div key={i} className="leading-6">{i + 1}</div>
                ))}
            </div>
            {/* Code Content */}
            <div className="flex-1">
                {codeLines.map((line, i) => (
                    <div key={i} className="leading-6 hover:bg-[#2a2d2e] cursor-pointer group relative" onClick={() => message.info(`Added comment to line ${i + 1}`)}>
                        <span className="text-[#9cdcfe]">{line}</span>
                        {i === 1 && (
                            <div className="absolute right-4 top-0 bg-yellow-600 text-white text-xs px-2 py-0.5 rounded shadow-sm opacity-80">
                                ⚠ Performance Issue
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const ThreeDEditor: React.FC<{ src: string }> = ({ src }) => (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative overflow-hidden perspective-1000">
        <div className="absolute top-4 left-4 text-gray-500 text-sm">
            Use Mouse to Rotate • Scroll to Zoom
        </div>

        {/* Simulated 3D Object (Cube) */}
        <div className="relative w-64 h-64 transform-style-3d animate-spin-slow cursor-move"
            style={{ transform: 'rotateX(-20deg) rotateY(45deg)' }}
            onClick={() => message.success('Placed 3D Anchor Point')}>
            {/* Faces would typically be here, simplified as a box representation */}
            <div className="absolute inset-0 border-4 border-blue-500 bg-blue-500 bg-opacity-10 transform translate-z-10"></div>
            <div className="absolute inset-0 border-4 border-blue-500 bg-blue-500 bg-opacity-10 transform rotate-y-90 translate-z-10"></div>

            {/* Interaction Points */}
            <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full shadow-glow animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-3 h-3 bg-green-500 rounded-full shadow-glow"></div>
        </div>

        {/* Gizmo */}
        <div className="absolute bottom-4 right-4 w-20 h-20 pointer-events-none">
            <div className="w-full h-0.5 bg-red-500 absolute top-1/2"></div>
            <div className="h-full w-0.5 bg-green-500 absolute left-1/2"></div>
            <div className="w-full h-0.5 bg-blue-500 absolute top-1/2 transform rotate-45"></div>
        </div>
    </div>
);

interface Props {
    type: AnnotationType;
    content: any;
    loading?: boolean;
    selectedTool: string;
}

const Canvas: React.FC<Props> = ({ type, content, loading, selectedTool }) => {
    if (loading) return <div className="flex items-center justify-center h-full"><Spin size="large" tip="Loading asset..." /></div>;
    if (!content) return <div className="flex items-center justify-center h-full text-gray-400">No item selected</div>;

    switch (type) {
        case 'IMAGE': return <ImageEditor src={content.url} tool={selectedTool} />;
        case 'TEXT': return <TextEditor content={content} />;
        case 'AUDIO': return <AudioEditor src={content.url} />;
        case 'VIDEO': return <VideoEditor src={content.url} />;
        case 'CODE': return <CodeEditor content={content.text} />;
        case '3D': return <ThreeDEditor src={content.url} />;
        default: return <div>Unsupported Type</div>;
    }
};

export default Canvas;
