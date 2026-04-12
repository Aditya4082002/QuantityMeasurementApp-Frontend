import { useState, useEffect } from 'react';
import { measurementService } from '../services/api';
import { showToast } from './Toast';

const UNITS = {
  LENGTH: [
    { v: 'FEET', l: 'Feet (ft)' },
    { v: 'INCH', l: 'Inch (in)' },
    { v: 'YARD', l: 'Yard (yd)' },
    { v: 'CENTIMETER', l: 'Centimeter (cm)' }
  ],
  WEIGHT: [
    { v: 'KILOGRAM', l: 'Kilogram (kg)' },
    { v: 'GRAM', l: 'Gram (g)' },
    { v: 'POUND', l: 'Pound (lb)' }
  ],
  VOLUME: [
    { v: 'LITER', l: 'Liter (L)' },
    { v: 'MILLILITER', l: 'Milliliter (mL)' },
    { v: 'GALLON', l: 'Gallon (gal)' }
  ],
  TEMPERATURE: [
    { v: 'CELSIUS', l: 'Celsius (°C)' },
    { v: 'FAHRENHEIT', l: 'Fahrenheit (°F)' }
  ]
};

const TEMP_OPS = new Set(['COMPARE', 'CONVERT']);

const Calculator = () => {
  const [operation, setOperation] = useState('ADD');
  const [category, setCategory] = useState('LENGTH');
  const [value1, setValue1] = useState('');
  const [unit1, setUnit1] = useState('FEET');
  const [value2, setValue2] = useState('');
  const [unit2, setUnit2] = useState('FEET');
  const [targetUnit, setTargetUnit] = useState('INCH');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shake1, setShake1] = useState(false);
  const [shake2, setShake2] = useState(false);

  useEffect(() => {
    // Update units when category changes
    const units = UNITS[category] || [];
    if (units.length > 0) {
      setUnit1(units[0].v);
      setUnit2(units[0].v);
      setTargetUnit(units.length > 1 ? units[1].v : units[0].v);
    }
    setResult(null);
  }, [category]);

  useEffect(() => {
    // Handle temperature operation restrictions
    if (category === 'TEMPERATURE' && !TEMP_OPS.has(operation)) {
      setOperation('COMPARE');
    }
    setResult(null);
  }, [category, operation]);

  const parseResult = (raw = '') => {
    const match = raw.match(/Quantity\(([^,]+),\s*([^)]+)\)/);
    if (match) return { value: match[1].trim(), unit: match[2].trim() };
    return { value: raw, unit: '' };
  };

  const handleCalculate = async () => {
    setShake1(false);
    setShake2(false);

    let hasError = false;
    if (!value1) {
      setShake1(true);
      hasError = true;
    }
    if (operation !== 'CONVERT' && !value2) {
      setShake2(true);
      hasError = true;
    }

    if (hasError) {
      showToast('Please fill in all required fields.', 'error');
      setTimeout(() => {
        setShake1(false);
        setShake2(false);
      }, 600);
      return;
    }

    setLoading(true);
    try {
      const quantity1 = {
        value: parseFloat(value1),
        unit: unit1,
        measurementType: category,
        operation
      };

      const quantity2 = operation === 'CONVERT'
        ? { ...quantity1 }
        : {
            value: parseFloat(value2),
            unit: unit2,
            measurementType: category,
            operation
          };

      const payload = { quantity1, quantity2 };
      if (operation === 'CONVERT') {
        payload.targetUnit = targetUnit;
      }

      const response = await measurementService.calculate(payload,operation.toLowerCase());
      const parsed = parseResult(response.result);
      
      setResult({
        value: parsed.value,
        unit: parsed.unit,
        label: getResultLabel(operation),
        operation
      });

      showToast('Calculation successful!', 'success', 2000);
    } catch (error) {
      showToast(error.message || 'Calculation failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getResultLabel = (op) => {
    const labels = {
      ADD: 'Sum',
      SUBTRACT: 'Difference',
      DIVIDE: 'Quotient',
      COMPARE: 'Comparison',
      CONVERT: 'Converted Value'
    };
    return labels[op] || 'Result';
  };

  const getOperationEmoji = (op) => {
    const emojis = {
      ADD: '➕',
      SUBTRACT: '➖',
      DIVIDE: '➗',
      COMPARE: '⚖️',
      CONVERT: '🔄'
    };
    return emojis[op] || '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <section className="panel glass">
        {/* Operation Tabs */}
        <div className="input-group">
          <label>Operation</label>
          <div className="op-tabs">
            {['ADD', 'SUBTRACT', 'DIVIDE', 'COMPARE', 'CONVERT'].map(op => (
              <button
                key={op}
                className={`op-tab ${operation === op ? 'active' : ''}`}
                disabled={category === 'TEMPERATURE' && !TEMP_OPS.has(op)}
                onClick={() => setOperation(op)}
              >
                {getOperationEmoji(op)} {op.charAt(0) + op.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Temperature Warning */}
        {category === 'TEMPERATURE' && (
          <div className="temp-warning show">
            <i className="ph ph-warning"></i>
            Temperature only supports <strong>&nbsp;Compare&nbsp;</strong> and <strong>&nbsp;Convert&nbsp;</strong>.
          </div>
        )}

        {/* Category Selection */}
        <div className="form-row">
          <div className="input-group">
            <label htmlFor="measureType">Measurement Category</label>
            <div className="input-wrapper">
              <i className="ph ph-ruler"></i>
              <select
                id="measureType"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="LENGTH">Length</option>
                <option value="WEIGHT">Weight / Mass</option>
                <option value="VOLUME">Volume</option>
                <option value="TEMPERATURE">Temperature</option>
              </select>
            </div>
          </div>

          {operation === 'CONVERT' && (
            <div className="input-group">
              <label htmlFor="targetUnitSelect">Convert To</label>
              <div className="input-wrapper">
                <i className="ph ph-arrows-left-right"></i>
                <select
                  id="targetUnitSelect"
                  value={targetUnit}
                  onChange={(e) => setTargetUnit(e.target.value)}
                >
                  {UNITS[category]?.map(unit => (
                    <option key={unit.v} value={unit.v}>{unit.l}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Value 1 */}
        <div className="input-group">
          <label>First Value</label>
          <div className={`combo-input ${shake1 ? 'error-shake' : ''}`}>
            <input
              type="number"
              placeholder="Enter value…"
              step="any"
              value={value1}
              onChange={(e) => setValue1(e.target.value)}
            />
            <select value={unit1} onChange={(e) => setUnit1(e.target.value)}>
              {UNITS[category]?.map(unit => (
                <option key={unit.v} value={unit.v}>{unit.l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Value 2 */}
        {operation !== 'CONVERT' && (
          <div className="input-group">
            <label>Second Value</label>
            <div className={`combo-input ${shake2 ? 'error-shake' : ''}`}>
              <input
                type="number"
                placeholder="Enter value…"
                step="any"
                value={value2}
                onChange={(e) => setValue2(e.target.value)}
              />
              <select value={unit2} onChange={(e) => setUnit2(e.target.value)}>
                {UNITS[category]?.map(unit => (
                  <option key={unit.v} value={unit.v}>{unit.l}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleCalculate}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span> Calculating…
            </>
          ) : (
            <>
              <i className="ph ph-calculator"></i> Calculate
            </>
          )}
        </button>
      </section>

      {/* Result Panel */}
      {result && (
        <section className="result-panel glass show">
          <div className="success-glow"></div>
          <div className="result-content">
            <span className="result-label">{result.label}</span>
            <div className="result-value">
              <span>{result.value}</span>
              {result.unit && <span className="result-unit">{result.unit}</span>}
            </div>
          </div>
          <i className="ph-fill ph-check-circle result-icon"></i>
        </section>
      )}
    </div>
  );
};

export default Calculator;
