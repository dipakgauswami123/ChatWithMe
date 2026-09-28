// ShinyText.jsx
import './ShinyText.css';

export default function ShinyText({
  text,
  speed = 3,
  color = '#000000',
  shineColor = '#ffffff',
  spread = 100,
  className = '',
  style = {}
}) {
  return (
    <span
      className={`shiny-text ${className}`}
      style={{
        ...style,
        '--color': color,
        '--shine-color': shineColor,
        '--animation-duration': `${speed}s`,
        '--shine-spread': `${spread}%`
      }}
    >
      {text}
    </span>
  );
}
