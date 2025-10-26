// src/pages/ItemDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllItems } from '../services/ItemsService';
import { Itens } from '../types/Itens';
import './ItemDetails.css';
import QRCodeWithLabel from './QRCodeWithLabel';


const ItemDetails: React.FC = () => {
  const { nPatrimonio } = useParams<{ nPatrimonio: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Itens | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const items = await getAllItems();

        const normalizedItems = items.map((item: any) => ({
          nPatrimonio: item.npatrimonio || item.nPatrimonio || '',
          nAntigo: item.nantigo || item.nAntigo || '',
          descricao: item.descricao || '',
          conservacao: item.conservacao || '',
          valorBem: item.valorBem || 0,
          foto: item.foto || '',
          salaRegistrada: item.salaRegistrada || item.salaregistrada || '',
          salaAtual: item.salaAtual || item.salaatual || '',
          state: item.state || '',
          responsavel: item.responsavel || ''
        }));

        const foundItem = normalizedItems.find((item: Itens) => item.nPatrimonio === nPatrimonio);

        if (foundItem) {
          setItem(foundItem);
          setError(null);
        } else {
          setError(`Item com patrimônio nº ${nPatrimonio} não encontrado`);
        }
      } catch (err) {
        setError('Erro ao carregar o item');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (nPatrimonio) {
      fetchItem();
    } else {
      setError('Número de patrimônio não fornecido na URL');
      setLoading(false);
    }
  }, [nPatrimonio]);

  const handleBack = () => navigate('/items');

  const openImageInNewTab = (imageUrl: string) => window.open(imageUrl, '_blank');

  if (loading) {
    return (
      <div className="item-details-container">
        <div className="loading">Carregando detalhes do item...</div>
        <div className="info-subtext">Buscando item com patrimônio: {nPatrimonio}</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="item-details-container">
        <div className="error-message">{error || 'Item não encontrado'}</div>
        <div className="info-subtext">Patrimônio buscado: {nPatrimonio}</div>
        <button onClick={handleBack} className="btn-back">← Voltar para Lista</button>
      </div>
    );
  }

  return (
    <div className="item-details-container">
      <div className="item-details-header">
        <button onClick={handleBack} className="btn-back">← Voltar</button>
        <h1>Detalhes do Item</h1>
      </div>

      <div className="item-details-content">
        <div className="item-info-section">
          <div className="item-info-grid">
            <div className="info-card">
              <h3>Informações Básicas</h3>
              <div className="info-row"><span className="info-label">Patrimônio Nº:</span><span className="info-value">{item.nPatrimonio}</span></div>
              <div className="info-row"><span className="info-label">Nº Antigo:</span><span className="info-value">{item.nAntigo || 'N/A'}</span></div>
              <div className="info-row"><span className="info-label">Descrição:</span><span className="info-value">{item.descricao}</span></div>
              <div className="info-row"><span className="info-label">Estado:</span><span className="info-value">{item.state || 'N/A'}</span></div>
              <div className="info-row"><span className="info-label">Responsável:</span><span className="info-value">{item.responsavel}</span></div>
            </div>

            <div className="info-card">
              <h3>Condição e Valor</h3>
              <div className="info-row"><span className="info-label">Conservação:</span><span className="info-value">{item.conservacao}</span></div>
              <div className="info-row"><span className="info-label">Valor do Bem:</span><span className="info-value value-highlight">R$ {item.valorBem.toFixed(2)}</span></div>
            </div>

            <div className="info-card">
              <h3>Localização</h3>
              <div className="info-row"><span className="info-label">Sala Registrada:</span><span className="info-value">{item.salaRegistrada}</span></div>
              <div className="info-row"><span className="info-label">Sala Atual:</span><span className="info-value location-highlight">{item.salaAtual}</span></div>
              {item.salaRegistrada !== item.salaAtual && (
                <div className="location-warning">⚠️ Item foi movido da sala original</div>
              )}
            </div>
          </div>
        </div>

        {item.foto && (
          <div className="item-image-section">
            <h3>Imagem do Item</h3>
            <div className="image-container">
              <img
                src={item.foto}
                alt={`Imagem do item ${item.nPatrimonio}`}
                className="item-image"
                onClick={() => openImageInNewTab(item.foto)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://via.placeholder.com/400x300?text=Imagem+não+disponível';
                }}
              />
              <p className="image-hint">Clique na imagem para visualizar em tamanho completo</p>
            </div>
          </div>
        )}
      <div className="item-qrcode-section">
        <h3>QR Code do Item</h3>
        <QRCodeWithLabel 
          link={window.location.href} 
          patrimonio={item.nPatrimonio} 
          descricao={item.descricao} 
        />

        <p className="image-hint">Escaneie o QR Code ou leia o número abaixo</p>
      </div>
      </div>
    </div>
  );
};

export default ItemDetails;
