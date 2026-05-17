import '../page_styles/Loader.css';

export default function Loader({ lines = 5 }) {
    return (
        <div className='skeleton-wrapper'>
            {Array.from({ length: lines}).map((_, i) => (
                <div key={i} className='skeleton-line'/>
            ))}
        </div>

    );
}