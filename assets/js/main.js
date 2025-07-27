const pokemonList = document.getElementById('pokemonList')
const loadMoreButton = document.getElementById('loadMoreButton')
const maxRecords = 151
const limit = 10
let offset = 0;

function convertPokemonToLi(pokemon) {
    return `
         <li class="pokemon ${pokemon.type}" onclick="showPokemonDetail('${pokemon.name}')">
            <span class="number">#${pokemon.number}</span>
            <span class="name">${pokemon.name}</span>
            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                </ol>
                <img src="${pokemon.photo}" alt="${pokemon.name}">
            </div>
        </li>
    `
}

function loadPokemonItens(offset, limit) {
    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
        const newHtml = pokemons.map(convertPokemonToLi).join('')
        pokemonList.innerHTML += newHtml
    })
}

loadPokemonItens(offset, limit)

loadMoreButton.addEventListener('click', () => {
    offset += limit
    const qtdRecordsWithNexPage = offset + limit

    if (qtdRecordsWithNexPage >= maxRecords) {
        const newLimit = maxRecords - offset
        loadPokemonItens(offset, newLimit)

        loadMoreButton.parentElement.removeChild(loadMoreButton)
    } else {
        loadPokemonItens(offset, limit)
    }
})

async function showPokemonDetail(pokemonName) {
    const detailSection = document.getElementById('pokemonDetailView')
    const listSection = document.querySelector('.content:not(#pokemonDetailView)')

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
        const data = await response.json()

        const pokemon = {
            number: data.id,
            name: data.name,
            types: data.types.map(t => t.type.name),
            type: data.types[0].type.name,
            photo: data.sprites.other['official-artwork'].front_default,
            height: (data.height / 10).toFixed(2) + " m",
            weight: (data.weight / 10).toFixed(2) + " kg",
            abilities: data.abilities.map(a => a.ability.name),
            stats: data.stats.map(s => ({
                name: s.stat.name,
                value: s.base_stat
            }))
        }

        renderPokemonDetail(pokemon)

        detailSection.style.display = 'block'
        listSection.style.display = 'none'
    } catch (error) {
        console.error('Erro ao buscar detalhes:', error)
        document.getElementById('pokemonDetail').innerHTML = '<p>Erro ao carregar detalhes do Pokémon.</p>'
    }
}

function renderPokemonDetail(pokemon) {
    const typesHTML = pokemon.types.map(type => `<li class="type ${type}">${type}</li>`).join("")
    const statsHTML = pokemon.stats.map(stat => `
        <div style="margin-bottom: .5rem;">
            <strong>${stat.name}</strong>
            <div style="background: #eee; border-radius: 8px; overflow: hidden;">
                <div style="width: ${stat.value > 100 ? 100 : stat.value}%; background: #4caf50; padding: 2px 4px; color: #fff;">
                    ${stat.value}
                </div>
            </div>
        </div>
    `).join("")

    document.getElementById("pokemonDetail").innerHTML = `
        <div class="pokemon ${pokemon.type}">
            <span class="number">#${pokemon.number}</span>
            <span class="name">${pokemon.name}</span>

            <div class="detail">
                <img src="${pokemon.photo}" alt="${pokemon.name}" style="width: 150px; height: auto;">
                <ol class="types">${typesHTML}</ol>
            </div>

            <p><strong>Altura:</strong> ${pokemon.height}</p>
            <p><strong>Peso:</strong> ${pokemon.weight}</p>
            <p><strong>Habilidades:</strong> ${pokemon.abilities.join(", ")}</p>

            <h3 style="margin-top: 1rem;">Base Stats</h3>
            ${statsHTML}
        </div>
    `
}

document.getElementById('backButton').addEventListener('click', () => {
    document.getElementById('pokemonDetailView').style.display = 'none'
    document.querySelector('.content:not(#pokemonDetailView)').style.display = 'block'
})
