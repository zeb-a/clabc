import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const SetupWizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [classInfo, setClassInfo] = useState({ name: '', grade: '3rd Grade' });
  const [studentInput, setStudentInput] = useState("");

  const handleFinish = () => {
    // Convert text area lines into student objects
    const names = studentInput.split('\n').filter(name => name.trim() !== "");
    const newStudents = names.map((name, index) => ({
      id: Date.now() + index,
      name: name.trim(),
      score: 0,
      group: 'Group 1'
    }));
    onComplete(newStudents, classInfo.name);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#F4F1EA', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 5000 }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', width: '600px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        
        {/* STEP 1: ADD YOUR CLASS */}
        {step === 1 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', border: '4px dashed #ccc', borderRadius: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', color: '#ccc' }}>
              <Plus size={40} />
            </div>
            <h2 style={{ color: '#555' }}>Add Your Class</h2>
            <div style={{ marginTop: '30px', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Class Name</label>
              <input 
                type="text" 
                placeholder="e.g. NEW classABC!" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' }}
                value={classInfo.name}
                onChange={(e) => setClassInfo({...classInfo, name: e.target.value})}
              />
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Grade/Age</label>
              <select style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <option>3rd Grade</option>
                <option>4th Grade</option>
                <option>5th Grade</option>
              </select>
            </div>
            <button 
              disabled={!classInfo.name}
              onClick={() => setStep(2)}
              style={{ marginTop: '30px', width: '100%', padding: '15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', opacity: classInfo.name ? 1 : 0.5 }}
            >
              Add My Class!
            </button>
          </div>
        )}

        {/* STEP 2: SELECT AVATAR TYPE */}
        {step === 2 && (
          <div style={{ textAlign: 'center' }}>
            <h2>Select an avatar type</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
              <div onClick={() => setStep(3)} style={{ border: '2px solid #4CAF50', padding: '20px', borderRadius: '15px', cursor: 'pointer' }}>
                <div style={{ fontSize: '3rem' }}>🐱</div>
                <p>Classic Monsters</p>
              </div>
              <div style={{ border: '1px solid #eee', padding: '20px', borderRadius: '15px', color: '#ccc' }}>
                <div style={{ fontSize: '3rem' }}>🤖</div>
                <p>Robots (Premium)</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ADD STUDENTS */}
        {step === 3 && (
          <div>
            <h2 style={{ textAlign: 'center' }}>Add your students</h2>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>Type one student name per line</p>
            <textarea 
              style={{ width: '100%', height: '200px', padding: '15px', borderRadius: '10px', border: '1px solid #ddd', marginTop: '10px', fontFamily: 'inherit' }}
              placeholder="Larry Page&#10;Sergey Brin&#10;Bill Gates"
              value={studentInput}
              onChange={(e) => setStudentInput(e.target.value)}
            ></textarea>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={handleFinish}
                style={{ flex: 1, padding: '15px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Add {studentInput.split('\n').filter(n => n.trim()).length} Students
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupWizard;