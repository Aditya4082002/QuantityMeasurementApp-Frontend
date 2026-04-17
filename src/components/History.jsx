import { useState, useEffect } from 'react';
import { measurementService } from '../services/api';
import { showToast } from './Toast';

const History = () => {
  const [activeOperation, setActiveOperation] = useState('ADD');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory(activeOperation);
  }, [activeOperation]);

  const loadHistory = async (operation) => {
    setLoading(true);
    try {
      const data = await measurementService.getHistory(operation);
      setHistory(data || []);
    } catch (error) {
      showToast(error.message || 'Failed to load history.', 'error');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOperationSymbol = (op) => {
    const symbols = {
      ADD: '+',
      SUBTRACT: '−',
      DIVIDE: '÷',
      COMPARE: '⚖',
      CONVERT: '→'
    };
    return symbols[op] || op;
  };

  return (
    <div>
      <section className="history-panel glass">
        <div className="history-header">
          <span className="history-title">Operation History</span>
          <div className="history-filter">
            {['ADD', 'SUBTRACT', 'DIVIDE', 'COMPARE', 'CONVERT'].map(op => (
              <button
                key={op}
                className={`history-btn ${activeOperation === op ? 'active' : ''}`}
                onClick={() => setActiveOperation(op)}
              >
                {op.charAt(0) + op.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="history-table-wrap">
          {loading ? (
            <div className="empty-history">
              <span className="spinner"></span> Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="empty-history">
              No {activeOperation.toLowerCase()} operations found.
            </div>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Operation</th>
                  <th>Input</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={index}>
                    <td>{formatDate(item.timestamp)}</td>
                    <td>
                      <span className="op-badge">{getOperationSymbol(item.operation)}</span>
                    </td>
                    <td className="input-cell">
                      {item.quantity1?.value} {item.quantity1?.unit}
                      {item.operation !== 'CONVERT' && (
                        <>
                          {' '}{getOperationSymbol(item.operation)}{' '}
                          {item.quantity2?.value} {item.quantity2?.unit}
                        </>
                      )}
                      {item.operation === 'CONVERT' && item.targetUnit && (
                        <> → {item.targetUnit}</>
                      )}
                    </td>
                    <td className="result-cell">
                      <strong>{item.result || 'N/A'}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default History;
