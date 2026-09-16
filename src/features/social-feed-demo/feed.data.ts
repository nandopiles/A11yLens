/** Repository: mock content for the social feed demo. */

export interface FeedPost {
  id: string;
  author: string;
  handle: string;
  /** Deliberately dense body text with no heading structure. */
  body: string;
  /** Background color for the "photo" block behind the caption. */
  photoColor: string;
  caption: string;
}

export const feedPosts: FeedPost[] = [
  {
    id: 'p1',
    author: 'Nordic Trails',
    handle: '@nordictrails',
    body:
      'Recién vuelto de tres semanas en los fiordos y sinceramente la luz de allí arriba le hace algo a tu sentido del tiempo dejas de mirar el móvil dejas de contar las horas solo caminas y el sendero se sigue desplegando y cada cresta parece igual a la anterior hasta que de pronto deja de serlo y todo el valle se abre bajo tus pies de golpe.',
    photoColor: '#3b6ea5',
    caption: 'Amanecer sobre la cresta norte',
  },
  {
    id: 'p2',
    author: 'Studio Kai',
    handle: '@studiokai',
    body:
      'Nuevo lanzamiento este viernes pasamos meses en los detalles las costuras el gramaje del papel la forma en que se asienta la tinta y no podemos esperar a que lo tengas en las manos no hay nada como un objeto físico en un mundo de pantallas y lo decimos con toda el alma así que apunta la fecha y avisa a un amigo.',
    photoColor: '#b06a3b',
    caption: 'Entre bastidores en el estudio',
  },
  {
    id: 'p3',
    author: 'City Eats',
    handle: '@cityeats',
    body:
      'La mejor comida es la que no planeaste el sitio pequeño sin cartel el dueño que insiste en que pruebes el plato del día la mesa que baila sobre los adoquines el plato que llega antes de que termines de preguntar qué es y entonces ese primer bocado que reorganiza tu tarde entera a su alrededor.',
    photoColor: '#4a7c59',
    caption: 'El plato del día, emplatado',
  },
];

export const liveBadgeLabel = 'EN VIVO';
