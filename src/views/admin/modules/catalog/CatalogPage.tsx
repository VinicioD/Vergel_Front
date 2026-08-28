import React, { useState } from 'react';
import PlantCard from '../../../../components/PlantCard';
import CategoryFilter from '../../../../components/CategoryFilter';
import Input from '../../../../components/Input';
import Button from '../../../../components/Button';

// Opciones para el CategoryFilter
const CATEGORY_OPTIONS = [
  { label: 'Todas', value: 'Todas' },
  { label: 'Interiores', value: 'Interiores' },
  { label: 'Exteriores', value: 'Exteriores' },
  { label: 'Ornamentales', value: 'Ornamentales' },
  { label: 'Frutales', value: 'Frutales' }
];

// Datos estáticos de plantas
const MOCK_PLANTS = [
  {
    id: '1',
    name: 'Monstera Deliciosa',
    scientificName: 'Monstera deliciosa',
    price: '$24.50',
    category: 'Interiores',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Ficus Lyrata',
    scientificName: 'Ficus lyrata',
    price: '$32.00',
    category: 'Interiores',
    imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Lavanda Francesa',
    scientificName: 'Lavandula dentata',
    price: '$12.00',
    category: 'Exteriores',
    imageUrl: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'Palmera Kentia',
    scientificName: 'Howea forsteriana',
    price: '$45.00',
    category: 'Ornamentales',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '5',
    name: 'Rosal Trepador',
    scientificName: 'Rosa Explorer',
    price: '$18.50',
    category: 'Ornamentales',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '6',
    name: 'Olivo Enano',
    scientificName: 'Olea europaea "Montra"',
    price: '$55.00',
    category: 'Frutales',
    imageUrl: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?q=80&w=600&auto=format&fit=crop'
  }
];

export const CatalogPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div style={{ padding: '2rem', backgroundColor: '#F3EFEE', minHeight: '100vh' }}>
      
      {/* 1. Header con Título y Usuario */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: '#2A3319', margin: 0, fontWeight: 'bold' }}>Catálogo de Plantas</h1>
          <p style={{ color: '#6B7280', margin: '0.2rem 0 0 0', fontSize: '0.9rem' }}>
            Inventario y especificaciones de especies botánicas disponibles
          </p>
        </div>
        
        {/* Chip de Usuario (Esquina superior derecha según Figma) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" 
            alt="Carlos Huerta" 
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.85rem', color: '#2A3319' }}>Carlos Huerta</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#6B7280' }}>Administrador</p>
          </div>
        </div>
      </div>

      {/* 2. Barra de Filtros, Buscador y Botón */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <div style={{ width: '220px' }}>
            <Input 
              type="text" 
              placeholder="Buscar por nombre..." 
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <CategoryFilter 
            options={CATEGORY_OPTIONS}
            value={selectedCategory}
            onChange={(val: string) => setSelectedCategory(val)}
          />
        </div>

        <Button style={{ backgroundColor: '#586A27', color: '#FFF' }}>
          Agregar Planta
        </Button>
      </div>

      {/* 3. Grilla de Plantas (PlantCard) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {MOCK_PLANTS.map((plant) => (
          <PlantCard 
            key={plant.id}
            plant={plant}
            onViewDetails={(selectedPlant) => console.log('Ver ficha de:', selectedPlant)}
          />
        ))}
      </div>

    </div>
  );
};

export default CatalogPage;