import {useState} from 'react'
import s from './Toggle.module.css';

const Toggle = ({text = ''}) => {

  const [isChecked, setIsChecked] = useState(false);

  return (
    <div >
    <div className={s.toggle}>
    {text}
    </div>
    <label>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => setIsChecked(!isChecked)}
      />
    </label>
    </div>
  );
};

Toggle.displayName = 'Toggle';
export default Toggle;
