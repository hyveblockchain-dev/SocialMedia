import { css } from '@emotion/css'

export function Button({
  buttonText,
  onClick
}) {
  return (
    <button
      className={buttonStyle}
      onClick={onClick}
    >{buttonText}</button>
  )
}

const buttonStyle = css`
  border: none;
  outline: none;
  margin-left: 15px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #000000;
  padding: 17px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  transition: all .35s;
  width: 240px;
  letter-spacing: .75px;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(251, 191, 36, 0.5);
    background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%);
  }
`
