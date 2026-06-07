'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Users, MessageCircle, Star, MapPin, X } from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  avatar: string;
  expertise: string[];
  rating: number;
  studentsHelped: number;
  availability: 'online' | 'offline' | 'busy';
  location: string;
  languages: string[];
  badges: string[];
  hourlyRate?: number;
  isFree: boolean;
}

const PeerMentoring: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

  useEffect(() => {
    // Simuler le chargement des mentors
    loadMentors();
  }, []);

  const loadMentors = () => {
    const mockMentors: Mentor[] = [
      {
        id: '1',
        name: 'Fatoumata Diallo',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces',
        expertise: ['React.js', 'Node.js', 'MongoDB'],
        rating: 4.9,
        studentsHelped: 47,
        availability: 'online',
        location: 'Dakar, Sénégal',
        languages: ['Français', 'Anglais', 'Wolof'],
        badges: ['Expert React', 'Top Mentor', 'Community Leader'],
        isFree: true,
      },
      {
        id: '2',
        name: 'Kofi Mensah',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=faces',
        expertise: ['Python', 'Machine Learning', 'Data Science'],
        rating: 4.8,
        studentsHelped: 32,
        availability: 'online',
        location: 'Accra, Ghana',
        languages: ['Anglais', 'Twi', 'Français'],
        badges: ['ML Expert', 'Data Guru', 'Python Master'],
        hourlyRate: 25,
        isFree: false,
      },
      {
        id: '3',
        name: 'Aisha Bello',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
        expertise: ['UX/UI Design', 'Figma', 'Prototyping'],
        rating: 4.7,
        studentsHelped: 28,
        availability: 'busy',
        location: 'Lagos, Nigeria',
        languages: ['Anglais', 'Hausa', 'Yoruba'],
        badges: ['Design Expert', 'Creative Leader', 'UX Champion'],
        hourlyRate: 30,
        isFree: false,
      },
      {
        id: '4',
        name: 'Moussa Traoré',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=faces',
        expertise: ['DevOps', 'AWS', 'Docker'],
        rating: 4.6,
        studentsHelped: 35,
        availability: 'offline',
        location: 'Bamako, Mali',
        languages: ['Français', 'Bambara', 'Anglais'],
        badges: ['DevOps Pro', 'Cloud Expert', 'Infrastructure Guru'],
        isFree: true,
      },
    ];

    setMentors(mockMentors);
  };

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.expertise.some(exp => exp.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesExpertise = expertiseFilter === 'all' || mentor.expertise.includes(expertiseFilter);
    const matchesAvailability = availabilityFilter === 'all' || mentor.availability === availabilityFilter;

    return matchesSearch && matchesExpertise && matchesAvailability;
  });

  const expertiseOptions = ['all', 'React.js', 'Node.js', 'Python', 'Machine Learning', 'UX/UI Design', 'DevOps'];
  const availabilityOptions = ['all', 'online', 'offline', 'busy'];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
    case 'online':
      return 'text-green-600 bg-green-100';
    case 'offline':
      return 'text-gray-600 bg-gray-100';
    case 'busy':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
    case 'online':
      return <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>;
    case 'offline':
      return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
    case 'busy':
      return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>;
    default:
      return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
    }
  };

  const handleMentorSelect = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowMentorModal(true);
  };

  const handleBookSession = (mentorId: string) => {
    // Logique de réservation de session
    console.log('Réservation de session avec le mentor:', mentorId);
    setShowMentorModal(false);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 text-sm font-medium rounded-full mb-6">
            <Users className="w-4 h-4 mr-2" />
            Mentorat Peer-to-Peer
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Apprenez avec des
            <span className="text-transparent bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text">
              {' '}mentors africains
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Connectez-vous avec des développeurs expérimentés d'Afrique pour accélérer votre apprentissage.
            Partagez vos connaissances et construisez votre réseau professionnel.
          </p>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <input
                type="text"
                placeholder="Nom, expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtre expertise */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expertise</label>
              <select
                value={expertiseFilter}
                onChange={(e) => setExpertiseFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {expertiseOptions.map(option => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'Toutes les expertises' : option}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre disponibilité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilité</label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availabilityOptions.map(option => (
                  <option key={option} value={option}>
                    {option === 'all' ? 'Toutes' :
                      option === 'online' ? 'En ligne' :
                        option === 'offline' ? 'Hors ligne' : 'Occupé'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grille des mentors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
              onClick={() => handleMentorSelect(mentor)}
            >
              {/* Header du mentor */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-300">
                    <Image
                      src={mentor.avatar}
                      alt={mentor.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{mentor.name}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600">{mentor.rating}</span>
                      </div>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{mentor.studentsHelped} étudiants aidés</span>
                    </div>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(mentor.availability)}`}>
                      {getAvailabilityIcon(mentor.availability)}
                      <span className="ml-2">
                        {mentor.availability === 'online' ? 'En ligne' :
                          mentor.availability === 'offline' ? 'Hors ligne' : 'Occupé'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expertise */}
              <div className="p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Expertise</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Localisation et langues */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {mentor.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {mentor.languages.join(', ')}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.badges.slice(0, 2).map((badge) => (
                    <span
                      key={badge}
                      className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Prix */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-gray-900">
                    {mentor.isFree ? 'Gratuit' : `$${mentor.hourlyRate}/h`}
                  </div>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                    Contacter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Statistiques */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{mentors.length}</div>
            <div className="text-sm text-gray-600">Mentors actifs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">
              {mentors.reduce((acc, mentor) => acc + mentor.studentsHelped, 0)}
            </div>
            <div className="text-sm text-gray-600">Étudiants aidés</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {mentors.filter(m => m.isFree).length}
            </div>
            <div className="text-sm text-gray-600">Mentors gratuits</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {mentors.reduce((acc, mentor) => acc + mentor.rating, 0) / mentors.length}
            </div>
            <div className="text-sm text-gray-600">Note moyenne</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-2xl hover:from-blue-700 hover:to-orange-600 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <Users className="mr-3 w-6 h-6" />
            Devenir mentor
          </button>
        </div>
      </div>

      {/* Modal de détail du mentor */}
      {showMentorModal && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Profil du Mentor</h2>
                <button
                  onClick={() => setShowMentorModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informations du mentor */}
                <div className="flex items-start space-x-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-blue-300">
                    <Image
                      src={selectedMentor.avatar}
                      alt={selectedMentor.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedMentor.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Note: {selectedMentor.rating} ⭐</span>
                      <span>{selectedMentor.studentsHelped} étudiants aidés</span>
                    </div>
                  </div>
                </div>

                {/* Expertise détaillée */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMentor.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Badges */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Badges et Récompenses</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMentor.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleBookSession(selectedMentor.id)}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                  >
                    Réserver une session
                  </button>
                  <button className="flex-1 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium">
                    Envoyer un message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PeerMentoring;
