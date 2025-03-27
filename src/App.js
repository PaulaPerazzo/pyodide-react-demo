import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pyodide, setPyodide] = useState(null);
  const [jsonFile, setJsonFile] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [loadingPyodide, setLoadingPyodide] = useState(true);

  // load Pyodide 
  useEffect(() => {
    async function loadPyodideAndPackages() {
      try {
        const pyodideInstance = await window.loadPyodide();
        await pyodideInstance.runPythonAsync(`
          import json
          def get_cheapest_cars(json_str):
              data = json.loads(json_str)
              cars = data["cars"]
              cheapest = sorted(cars, key=lambda car: car["price"])[:2]
              return json.dumps({"cheapest": cheapest})
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
      const jsonStr = e.target.result;
      try {
        const getCheapest = pyodide.globals.get("get_cheapest_cars");
        const res = getCheapest(jsonStr);
        setResultado(JSON.parse(res));
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
      {resultado && (
        <div>
          <h2>Dois Carros Mais Baratos:</h2>
          <pre>{JSON.stringify(resultado, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
