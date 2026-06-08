import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  applyNodeChanges,
  applyEdgeChanges
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import enData from './extracted_nodes.json';
import frData from './extracted_nodes_fr.json';
import './index.css';

const STORAGE_KEY = 'bayesian-network-state';

const langData = { en: enData, fr: frData };
const dictionaries = { en: {}, fr: {} };

['en', 'fr'].forEach(lang => {
  langData[lang].project_nodes.forEach(node => {
    if (node.type === 'standard_node') {
      dictionaries[lang][node.node_id] = { label: `${node.node_id}: ${node.question_text}`, allowed_states: node.allowed_states };
    } else if (node.type === 'template_node') {
      node.template_questions.forEach(sub => {
        dictionaries[lang][sub.sub_id] = { label: `${sub.sub_id}: ${sub.question_text}`, allowed_states: sub.allowed_states };
      });
    }
  });
});

// Flatten nodes function
const getInitialNodes = (lang = 'fr') => {
  const flattened = [];
  let yOffset = 50;
  let xOffset = 50;
  let col = 0;

  langData[lang].project_nodes.forEach((node) => {
    if (node.type === 'standard_node') {
      flattened.push({
        id: node.node_id,
        position: { x: xOffset + (col * 300), y: yOffset },
        data: dictionaries[lang][node.node_id],
        type: 'default',
      });
      col++;
      if (col > 3) { col = 0; yOffset += 150; }
    } else if (node.type === 'template_node') {
      node.template_questions.forEach((sub) => {
        flattened.push({
          id: sub.sub_id,
          position: { x: xOffset + (col * 300), y: yOffset },
          data: dictionaries[lang][sub.sub_id],
          type: 'default',
          style: { border: '2px solid #a855f7', borderRadius: '8px' }
        });
        col++;
        if (col > 3) { col = 0; yOffset += 150; }
      });
    }
  });
  return flattened;
};

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [linkingSource, setLinkingSource] = useState(null);
  const [saveName, setSaveName] = useState('bayes_graphe');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [language, setLanguage] = useState('fr');
  const fileInputRef = useRef(null);

  // Load state on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { nodes: savedNodes, edges: savedEdges, name, savedLang } = JSON.parse(saved);
        const initialLang = savedLang || 'fr';
        setLanguage(initialLang);
        
        const patchedNodes = savedNodes.map(n => ({
          ...n,
          data: dictionaries[initialLang][n.id] || n.data
        }));
        setNodes(patchedNodes);
        
        const patchedEdges = savedEdges.map(e => ({
          ...e,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1', width: 20, height: 20 },
          style: { stroke: '#6366f1', strokeWidth: 4 }
        }));
        setEdges(patchedEdges);
        if (name) setSaveName(name);
      } catch (e) {
        setNodes(getInitialNodes('fr'));
      }
    } else {
      setNodes(getInitialNodes('fr'));
    }
    setIsLoaded(true);
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (isLoaded) {
      const state = { nodes, edges, name: saveName, savedLang: language };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [nodes, edges, saveName, language, isLoaded]);

  const handleLanguageToggle = (newLang) => {
    setLanguage(newLang);
    setNodes((nds) => nds.map(n => ({
      ...n,
      data: dictionaries[newLang][n.id] || n.data
    })));
  };

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1', width: 20, height: 20 },
      style: { stroke: '#6366f1', strokeWidth: 4 }
    }, eds));
  }, [setEdges]);

  const onNodeClick = useCallback((event, node) => {
    if (!linkingSource) {
      setLinkingSource(node.id);
      setNodes((nds) => nds.map(n => n.id === node.id ? { ...n, style: { ...n.style, boxShadow: '0 0 0 4px #6366f1' } } : n));
    } else {
      if (linkingSource === node.id) {
        setLinkingSource(null);
        setNodes((nds) => nds.map(n => ({ ...n, style: { ...n.style, boxShadow: null } })));
        return;
      }
      const existingEdge = edges.find(e => 
        (e.source === linkingSource && e.target === node.id) || 
        (e.source === node.id && e.target === linkingSource)
      );
      if (existingEdge) {
        setEdges((eds) => eds.filter(e => e.id !== existingEdge.id));
      } else {
        onConnect({ source: linkingSource, target: node.id });
      }
      setNodes((nds) => nds.map(n => ({ ...n, style: { ...n.style, boxShadow: null } })));
      setLinkingSource(null);
    }
  }, [linkingSource, edges, onConnect, setNodes]);

  const onPaneClick = useCallback(() => {
    setLinkingSource(null);
    setNodes((nds) => nds.map(n => ({ ...n, style: { ...n.style, boxShadow: null } })));
  }, [setNodes]);

  const onSave = () => {
    if (saveName === 'extracted_nodes') {
      alert('L\'enregistrement sous "extracted_nodes" est restreint. Veuillez utiliser un nom différent pour votre configuration de réseau.');
      return;
    }

    const graphData = {
      nodes: nodes.map(n => ({ id: n.id, data: n.data, position: n.position, style: n.style, type: n.type })),
      edges: edges.map(e => ({ source: e.source, target: e.target })),
      name: saveName
    };
    const blob = new Blob([JSON.stringify(graphData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${saveName}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  const onResetToRaw = () => {
    if (window.confirm('Réinitialiser aux nœuds bruts non liés ? Cela effacera toutes vos connexions actuelles et les modifications de disposition.')) {
      setNodes(getInitialNodes(language));
      setEdges([]);
      setSaveName('bayes_graphe');
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const onFileLoad = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target.result);
          if (content.nodes) {
            const patchedNodes = content.nodes.map(n => ({
              ...n,
              data: dictionaries[language][n.id] || n.data
            }));
            setNodes(patchedNodes);
          }
          if (content.edges) setEdges(content.edges.map(e => ({
            ...e,
            id: `e-${e.source}-${e.target}`,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1', width: 20, height: 20 },
            style: { stroke: '#6366f1', strokeWidth: 4 }
          })));
          if (content.name) setSaveName(content.name);
          else setSaveName(file.name.replace('.json', ''));
        } catch (err) {
          alert('Erreur lors de l\'analyse du fichier JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="app-container">
      <header className="header glass">
        <div className="header-content">
          <h1>Bayesian Network Builder</h1>
          <p>Cliquez sur un nœud pour commencer la liaison. Cliquez sur un espace vide pour annuler.</p>
        </div>

        <div className="header-actions">
          <div className="action-box glass">
            <label>Langue</label>
            <button 
              className="mini-btn"
              style={{ background: language === 'en' ? '#6366f1' : 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}
              onClick={() => handleLanguageToggle('en')}
            >EN</button>
            <button 
              className="mini-btn"
              style={{ background: language === 'fr' ? '#6366f1' : 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}
              onClick={() => handleLanguageToggle('fr')}
            >FR</button>
          </div>

          <div className="action-box glass">
            <button onClick={() => fileInputRef.current.click()} className="mini-btn">Ouvrir un fichier</button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".json"
              onChange={onFileLoad}
            />
          </div>

          <div className="action-box glass" style={{ display: 'flex', gap: '8px', padding: '6px' }}>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              className="save-input"
              placeholder="Nom du fichier"
              style={{ width: '140px', margin: 0 }}
            />
            <button onClick={onSave} className="export-btn" style={{ margin: 0, padding: '4px 12px' }}>Sauvegarder</button>
          </div>

          <div className="action-group">
            <button onClick={onResetToRaw} className="reset-btn">Réinitialiser</button>
          </div>
        </div>
      </header>

      {showPopup && (
        <div className="save-popup glass">
          Enregistré avec succès dans votre dossier Téléchargements !
        </div>
      )}

      <main className="flow-container glass-panel">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          fitView
          className="react-flow-custom"
        >
          <Panel position="top-left" className="panel-info">
            <strong>Statistiques du graphe</strong>
            <div>Nœuds : {nodes.length}</div>
            <div>Liens : {edges.length}</div>
            {linkingSource && <div className="linking-status">Liaison depuis : {linkingSource}</div>}
          </Panel>
          <Controls />
          <MiniMap
            nodeColor={(n) => {
              if (n.style?.border) return '#a855f7';
              return '#4f46e5';
            }}
            maskColor="rgba(0, 0, 0, 0.4)"
            className="glass-minimap"
          />
          <Background color="transparent" gap={20} size={1} />
        </ReactFlow>
      </main>
    </div>
  );
}
