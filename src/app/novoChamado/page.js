'use client';

import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import Card from '@/components/card';
import StartCallWithFreelancer from '@/components/startCallWithFreelancer';
import axios from 'axios';

import { useState, useEffect, useRef } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export default function Config() {
    const [freelancers, setFreelancers] = useState([]);
    const [freelancersFiltered, setFreelancersFiltered] = useState([]);
    const [specialtyIsOpen, setSpecialtyIsOpen] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const selectRef = useRef(null);
    const [specialtyOptions, setSpecialtyOptions] = useState([]);

    const [starIsOpen, setStarIsOpen] = useState(false);
    const [selectedStar, setSelectedStar] = useState('');
    const starRef = useRef(null);
    const starOptions = [
        { visual: '☆☆☆☆☆', value: 0 },
        { visual: '★☆☆☆☆', value: 1 },
        { visual: '★★☆☆☆', value: 2 },
        { visual: '★★★☆☆', value: 3 },
        { visual: '★★★★☆', value: 4 },
        { visual: '★★★★★', value: 5 },
    ];

    const [selectedFreelancer, setSelectedFreelancer] = useState(null);

    useEffect(() => {
        axios
            .get(`${apiUrl}/freelancers/details`)
            .then((response) => {
                setFreelancers(response.data.freelancers);
                setFreelancersFiltered(response.data.freelancers);
            })
            .catch((error) => {
                alert(`Erro ${error.response.status}: ${error.response.data.error}`);
            });

        function handleClickOutside(event) {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setSpecialtyIsOpen(false);
            }
            if (starRef.current && !starRef.current.contains(event.target)) {
                setStarIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const fetchSpecialtyOptions = async () => {
            const allSpecialties = await freelancers
                .flatMap((f) => f.especialidades)
                .filter(Boolean);
            const uniqueSpecialties = await [
                ...new Set(
                    allSpecialties.map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
                ),
            ];
            setSpecialtyOptions(uniqueSpecialties);
        };
        fetchSpecialtyOptions();
    }, [freelancers]);

    useEffect(() => {
        let filtered = freelancers.filter((freelancer) => {
            const matchesSpecialty =
                selectedSpecialty === '' ||
                freelancer.especialidades
                    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
                    .includes(selectedSpecialty);
            const matchesStar =
                selectedStar === '' || freelancer.classificacao >= selectedStar - 0.5;
            return matchesSpecialty && matchesStar;
        });
        if (selectedStar !== '') {
            filtered.sort((a, b) => a.classificacao - b.classificacao);
            setFreelancersFiltered(filtered);
        } else {
            filtered.sort((a, b) => b.classificacao - a.classificacao);
            setFreelancersFiltered(filtered);
        }
    }, [selectedSpecialty, selectedStar, freelancers]);

    return (
        <>
            <Navbar />
            <main>
                <div className="flex flex-row justify-between w-full h-full">
                    <div className="flex basis-54/100 flex-col pl-50">
                        <div ref={selectRef} className="relative w-full pl-13">
                            <button
                                onClick={() => setSpecialtyIsOpen(!specialtyIsOpen)}
                                className="w-full bg-white font-medium pl-4 pr-10 py-2 text-left cursor-pointer"
                            >
                                <p className="text-[27px] font-medium">
                                    Qual o tipo de profissional que você procura?
                                </p>
                                {!specialtyIsOpen && (
                                    <span className="absolute right-3 top-2.5 text-gray-500">
                                        ▼
                                    </span>
                                )}
                                {specialtyIsOpen && (
                                    <span className="absolute right-3 top-2.5 text-gray-500">
                                        ▲
                                    </span>
                                )}
                            </button>
                            {specialtyIsOpen && (
                                <ul className="absolute z-100 mt-1 w-full bg-white border border-gray-300 divide-y divide-gray-300 rounded-md shadow-lg">
                                    {selectedSpecialty !== '' && (
                                        <li
                                            onClick={() => {
                                                setSelectedSpecialty('');
                                                setSpecialtyIsOpen(false);
                                            }}
                                            className="px-4 py-2 hover:bg-indigo-100 cursor-pointer"
                                        >
                                            Limpar escolha
                                        </li>
                                    )}
                                    {specialtyOptions.length > 0 ? specialtyOptions.map((option, idx) => (
                                        <li
                                            key={idx}
                                            onClick={() => {
                                                setSelectedSpecialty(option);
                                                setSpecialtyIsOpen(false);
                                            }}
                                            className={`px-4 py-2 hover:bg-indigo-50 cursor-pointer ${
                                                option === selectedSpecialty ? 'bg-indigo-100' : ''
                                            }`}
                                        >
                                            {option}
                                        </li>
                                    )) : (
                                        <li className="px-4 py-2 text-gray-500">
                                            Nenhuma especialidade disponível
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                        <div className="selfScroll grow">
                            {freelancersFiltered.map((freelancer, index) => (
                                <div key={index}>
                                    <Card
                                        selectFreelancer={(id) => {
                                            const freelancerResult = freelancersFiltered.find(
                                                (f) => f._id === id
                                            );
                                            setSelectedFreelancer(freelancerResult);
                                        }}
                                        id={freelancer._id}
                                        imagem={freelancer.user.image_URL}
                                        nome={freelancer.user.nome}
                                        especialidades={freelancer.especialidades}
                                        cidade={freelancer.endereco.cidade}
                                        estado={freelancer.endereco.estado}
                                        classificacao={freelancer.classificacao}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex basis-35/100 flex-col px-15">
                        <div ref={starRef} className="relative w-full text-[20px]">
                            <button
                                onClick={() => setStarIsOpen(!starIsOpen)}
                                className="w-full bg-white font-medium pl-4 pr-10 py-2 text-left cursor-pointer"
                            >
                                Avaliação
                                {!starIsOpen && (
                                    <span className="absolute right-3 top-2.5 text-gray-500">
                                        ▼
                                    </span>
                                )}
                                {starIsOpen && (
                                    <span className="absolute right-3 top-2.5 text-gray-500">
                                        ▲
                                    </span>
                                )}
                            </button>
                            {starIsOpen && (
                                <ul className="absolute z-100 mt-1 w-full bg-white border border-gray-300 divide-y divide-gray-300 rounded-md shadow-lg">
                                    {selectedStar !== '' && (
                                        <li
                                            onClick={() => {
                                                setSelectedStar('');
                                                setStarIsOpen(false);
                                            }}
                                            className="px-4 py-2 hover:bg-indigo-100 cursor-pointer"
                                        >
                                            Limpar escolha
                                        </li>
                                    )}
                                    {starOptions.map((option, idx) => (
                                        <li
                                            key={idx}
                                            onClick={() => {
                                                setSelectedStar(option.value);
                                                setStarIsOpen(false);
                                            }}
                                            className={`px-4 py-2 hover:bg-indigo-50 cursor-pointer text-lg font-medium ${
                                                option.value === selectedStar ? 'bg-indigo-100' : ''
                                            }`}
                                        >
                                            {option.visual}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="w-full">
                            <div className="flex flex-row mt-4 pl-4 py-2 w-full">
                                <label htmlFor="distance" className="font-medium text-[20px] ">
                                    Proximidade
                                </label>
                                <input
                                    type="number"
                                    name="distance"
                                    id="distance"
                                    defaultValue={10}
                                    min={1}
                                    className="w-full border border-gray-300 rounded-md px-2 ml-4 mr-1"
                                />
                                <span>km</span>
                            </div>
                            <div className="flex flex-row mt-4 gap-4 py-2 w-full aspect-video">
                                <div
                                    className="mapDistance grid border border-gray-300 rounded-md w-full bg-green-200"
                                    id="map"
                                >
                                    <div className="sticky w-25 h-25 rounded-full place-self-center border border-[#8ed5ff] bg-[#8ed5ff66] "></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <StartCallWithFreelancer
                open={selectedFreelancer}
                freelancer={selectedFreelancer}
                onClose={() => setSelectedFreelancer(null)}
            />
        </>
    );
}
