import React, { useState } from 'react';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

interface FormProps {
  onClose?: () => void;
}

export const Form: React.FC<FormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    scientificName: '',
    price: '',
    category: 'Interiores'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Planta guardada:', formData);
    if (onClose) onClose();
  };

  return (
    <div style={{
      backgroundColor: '#FFF',
      padding: '2rem',
      borderRadius: '12px',
      maxWidth: '450px',
      width: '100%',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: '#2A3319', marginTop: 0 }}>Agregar Nueva Planta</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ fontSize: '0.85rem', color: '#444' }}>Nombre Común</label>
          <Input 
            type="text" 
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', color: '#444' }}>Nombre Científico</label>
          <Input 
            type="text" 
            value={formData.scientificName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, scientificName: e.target.value})}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', color: '#444' }}>Precio ($)</label>
          <Input 
            type="text" 
            value={formData.price}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, price: e.target.value})}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '1rem' }}>
          {onClose && (
            <Button type="button" onClick={onClose} style={{ backgroundColor: '#CCC', color: '#333' }}>
              Cancelar
            </Button>
          )}
          <Button type="submit" style={{ backgroundColor: '#586A27', color: '#FFF' }}>
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Form;