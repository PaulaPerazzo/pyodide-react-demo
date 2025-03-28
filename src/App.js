import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pyodide, setPyodide] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loadingPyodide, setLoadingPyodide] = useState(true);

  useEffect(() => {
    async function loadPyodideAndPackages() {
      try {
        const pyodideInstance = await window.loadPyodide();
        await pyodideInstance.loadPackage("micropip");
        await pyodideInstance.runPythonAsync(`
          import micropip
          await micropip.install("sad-cin")
          from sad_cin import decision_support
          import json
          
          def get_results(json_str):
              data = json.loads(json_str)
              result = decision_support(data)
              return json.dumps(result)
          `);
        setPyodide(pyodideInstance);
      } catch (error) {
        console.error("Erro ao carregar o Pyodide:", error);
      } finally {
        setLoadingPyodide(false);
      }
    }
    loadPyodideAndPackages();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setJsonFile(e.target.files[0]);
    }
  };

  const processarArquivo = () => {
    if (!jsonFile || !pyodide) return;

    const reader = new FileReader();
    
    reader.onload = async (e) => {
      let jsonStr = e.target.result;
      
      if (jsonStr.trim().startsWith("vikor_decision_support(")) {
        jsonStr = jsonStr.replace(/^vikor_decision_support\(/, '').replace(/\)\s*$/, '');
      }
      
      try {
        const getCheapest = pyodide.globals.get("get_results");
        const res = getCheapest(jsonStr);
        setResult(JSON.parse(res));
      } catch (error) {
        console.error("Erro ao processar o arquivo:", error);
      }
    };
    reader.readAsText(jsonFile);
  };

  return (
    <div className="App">
      <h1>Exemplo Pyodide com React</h1>
      {loadingPyodide ? (
        <p>Carregando Pyodide...</p>
      ) : (
        <>
          <input type="file" accept=".json" onChange={handleFileChange} />
          <button onClick={processarArquivo}>Processar</button>
        </>
      )}
      {result && (
        <div>
          <h2>Resultado do metodo:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
