import portada from "../assets/peojects/saphire/saphire.jpg.webp";
import portada2 from "../assets/peojects/smart/smart (1).png.webp";
import portada3 from "../assets/peojects/buendia/buendia (3).jpg.webp";
import portada4 from "../assets/img/cicuta.png.webp";
import amorsacro from "../assets/img/portada4.jpg.webp";
import annet from "../assets/img/annet.jpg.webp";
import reliquia from "../assets/img/reliquia.jpg.webp";
import needyt from "../assets/peojects/needyt/needyt.jpg.webp";
import activa from "../assets/peojects/activa/activa (1).jpg.webp";
import santa from "../assets/peojects/santa/santa (1).jpg.webp";
import alea from "../assets/peojects/alea/alea (3).png.webp";
import report from "../assets/peojects/amvreport/report.png.webp";


export const projectRoutes = [
    "/sapphire",
    "/buendia",
    "/alea",
    "/needyt",
    "/smarthc",
    "/annet",
    "/santa",
    "/amvreport",
    "/amorsacro",
];


export const projects = [
    
    { title: 'The Sapphire', image: portada, description: 'Description of Artwork 1.', link: '/sapphire' },
    { title: 'Buendia Travels', image: portada3, description: 'Buendia description', link: '/buendia' },
    { title: 'Alea Software', image: alea, description: 'Description of Artwork 4.', link: '/alea' },
    { title: 'Needyt', image: needyt, description: 'Description of Artwork 4.', link: '/needyt' },
    { title: 'Smart Human Capital', image: portada2, description: 'Description of Artwork 2.', link: '/smarthc' },
    { title: 'AMORSACRO', image: amorsacro, description: 'Description here', link: '/amorsacro' },
    { title: 'AMV Report', image: report, description: 'Description of Artwork 4.', link: '/amvreport' },
    { title: 'Annet, piel de serpiente', image: annet, description: 'Description of Artwork 6.', link: '/annet' },
    { title: 'Santa Engracia', image: santa, description: 'Description here', link: '/santa' },
    { title: 'Activa', image: activa, description: 'Description of Artwork 4.', link: '#' },
    { title: 'Bienal Internacional de Oaxaca', image: reliquia, description: 'Description of Artwork 5.', link: '#' },
    { title: 'Cicuta González', image: portada4, description: 'Description of Artwork 5.', link: '#' },
];