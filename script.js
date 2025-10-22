// Endpoint base da API
const API_BASE_URL = 'https://super-mario-bros-character-api.onrender.com/api/';

// Elementos DOM
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('character-search');
const detailSection = document.getElementById('character-detail');
const errorSection = document.getElementById('error-message');
const historyContainer = document.getElementById('history-container');

// Array para armazenar o histórico de personagens
let historyCharacters = [];

// -----------------------------------------------------
// 1. Funções de Utilitário
// -----------------------------------------------------

function displayError(message) {
    detailSection.classList.add('hidden');
    detailSection.innerHTML = '';
    
    errorSection.innerHTML = `<p>${message}</p>`;
    errorSection.classList.remove('hidden');
}

function capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// -----------------------------------------------------
// 2. Função Principal de Busca
// -----------------------------------------------------

async function fetchCharacter() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    detailSection.classList.add('hidden');
    errorSection.classList.add('hidden');
    
    if (!searchTerm) {
        displayError('Por favor, digite o nome de um personagem (ex: Mario).');
        return;
    }
    
    // Verifica se o personagem já está no histórico (cache)
    const isCached = historyCharacters.some(char => char.name.toLowerCase() === searchTerm);
    
    if (isCached) {
        // Se já estiver no histórico, exibe a ficha principal e para.
        const cachedCharacter = historyCharacters.find(char => char.name.toLowerCase() === searchTerm);
        displayCharacter(cachedCharacter, searchTerm);
        return;
    }

    const API_URL = `${API_BASE_URL}${searchTerm}`;

    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error('Personagem não encontrado.');
        }
        
        const data = await response.json();
        
        // Adiciona no início do array (para aparecer primeiro no histórico)
        historyCharacters.unshift(data);
        
        // Exibe a ficha principal e atualiza o histórico
        displayCharacter(data, searchTerm);
        renderHistory();
        
        // Limpa o campo de busca
        searchInput.value = ''; 

    } catch (error) {
        console.error('Erro na requisição ou personagem não encontrado:', error);
        displayError(`Opa! Não encontramos o personagem <strong>"${capitalize(searchTerm)}"</strong> no Reino do Cogumelo. Verifique a ortografia.`);
    }
}

// -----------------------------------------------------
// 3. Função de Exibição (Ficha Principal)
// -----------------------------------------------------

/**
 * Exibe a ficha técnica do personagem na seção principal.
 */
function displayCharacter(characterData, searchTerm) {
    const character = Array.isArray(characterData) ? characterData[0] : characterData;
    
    // Mapeamento usando as chaves CORRETAS da API (origin, strength)
    const charName = character.name ? capitalize(character.name) : capitalize(searchTerm);
    const imageUrl = character.image || 'N/A';
    
    const firstGame = character.origin || 'N/A';     
    const ability = character.strength || 'N/A';     
    
    const finalImageUrl = (imageUrl && String(imageUrl).startsWith('http')) ? imageUrl : 'https://via.placeholder.com/120?text=IMAGEM+N/A';

    // HTML da Ficha Principal - Corrigido para layout de card retangular
    const htmlContent = `
        <img src="${finalImageUrl}" 
             alt="${charName}" 
             class="char-image">
        
        <div class="card-content">
            <h2>${charName}</h2>
            
            <div class="char-info">
                <p><strong>Primeira Aparição:</strong> ${firstGame}</p>
                <p><strong>Habilidade Principal:</strong> ${ability}</p>
            </div>
        </div>
    `;

    detailSection.innerHTML = htmlContent;
    detailSection.classList.remove('hidden');
}


// -----------------------------------------------------
// 4. Função para Renderizar o Histórico
// -----------------------------------------------------

function renderHistory() {
    if (historyCharacters.length === 0) {
        historyContainer.innerHTML = '';
        return;
    }
    
    // Cria o HTML do cabeçalho e da grid
    let historyHTML = `
        <h2>Personagens Pesquisados (${historyCharacters.length})</h2>
        <div class="history-grid">
    `;
    
    // Itera sobre o array de personagens do histórico
    historyCharacters.forEach(character => {
        const charName = character.name ? capitalize(character.name) : 'Desconhecido';
        const imageUrl = character.image || 'N/A';
        const firstGame = character.origin || 'N/A';
        const ability = character.strength || 'N/A';
        
        const finalImageUrl = (imageUrl && String(imageUrl).startsWith('http')) ? imageUrl : 'https://via.placeholder.com/80?text=IMAGEM+N/A';
        
        // Estrutura de cada card no histórico - Corrigido para layout de card retangular
        historyHTML += `
            <div class="history-card">
                <img src="${finalImageUrl}" alt="${charName}" class="char-image">
                <div class="card-content">
                    <h3>${charName}</h3>
                    <p><strong>Primeira Aparição:</strong> ${firstGame}</p>
                    <p><strong>Habilidade:</strong> ${ability}</p>
                </div>
            </div>
        `;
    });
    
    historyHTML += `</div>`;
    
    historyContainer.innerHTML = historyHTML;
}

// -----------------------------------------------------
// 5. Listeners de Eventos
// -----------------------------------------------------
searchButton.addEventListener('click', fetchCharacter);

searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        fetchCharacter();
    }
});