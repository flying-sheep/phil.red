import mdConvert from './md'
import rstConvert from './rst'


const converters = {
	md: mdConvert,
	rst: rstConvert,
}

export default converters
