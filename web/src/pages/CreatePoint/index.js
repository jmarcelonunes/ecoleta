import React, { useEffect, useState } from 'react';
import './styles.css';
import logo from '../../assets/logo.svg';
import api from '../../services/api';
import axios from "axios";
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet'

export default function CreatePoint () {
    const [items, setItems] = useState([]);
    const [ufs, setUfs] = useState([]);
    const [selectedUf, setSelectedUf] = useState('0');
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('0');
    const [initalPosition, setInitialPosition] = useState([0,0])
    const [selectedPosition, setSelectedPosition] = useState([0,0]);


    useEffect(() => {
        api.get('/items').then(response => {
            setItems(response.data);
        });      
    }, []);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            position => {
              const { latitude, longitude } = position.coords;
              setInitialPosition([latitude, longitude]);
            },
            err => {
              console.log(err);
              setInitialPosition([-15.7976077, -47.8830586]);
            },
            {
              timeout: 10000
            }
          );
          
    }, []);

    useEffect(() => {
        axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
        .then(response => (
            setUfs(response.data)
        ));
    }, []);

    useEffect(()=>{
        if(selectedUf === '0'){
            return
        }else{
            axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => (
                setCities(response.data)
            ));
        }
    }, [selectedUf]);

    function handleSelectedUf(event){
        const uf = event.target.value
        setSelectedUf(uf)
    }

    function handleSelectedCity(event){
        const city = event.target.value
        setSelectedCity(city)
    }

    function handleMapClick(event){
        setSelectedPosition([event.latlng.lat, event.latlng.lng])
    }

    function handleMarkerMove(event){
        setSelectedPosition([event.target._latlng.lat, event.target._latlng.lng])
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to="/">
                    <FiArrowLeft />
                    Voltar
                </Link>
            </header>
            <form action="">
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initalPosition} dragging={true} zoom={12} onClick={handleMapClick} >
                        <TileLayer 
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker  onDragend={handleMarkerMove} draggable={true} position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado</label>
                            <select name="uf" 
                                    id="uf" value={selectedUf}
                                    onChange={event => handleSelectedUf(event)}
                            >
                                {ufs.map((uf) => (
                                    <option key={uf.id} value={uf.sigla}>{uf.sigla}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" onChange={event => handleSelectedCity(event)}>
                                {cities.map(city => (
                                    <option key={city.id} value={city.nome}>{city.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id}>
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">
                    Cadastrar Ponto
                </button>
            </form>
        </div>
    )
};

