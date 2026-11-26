import logoMark from '../assets/logo-mark.png'

export default function Brand() {
  return (
    <span className="brand" aria-label="TECH BOOST">
      <img src={logoMark} alt="" width={40} height={39} />
      <b>
        TECH<span>BOOST</span>
      </b>
    </span>
  )
}
