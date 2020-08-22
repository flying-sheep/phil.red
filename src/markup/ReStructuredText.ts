import * as React from 'react'
import { Typography } from '@material-ui/core'
import { ThemeStyle } from '@material-ui/core/styles/createTypography'
import { Node, DirectiveType } from 'restructured'
import { InlineMath } from 'react-katex'

import Markup from '../components/markup/Markup'
import ASTError, { ASTErrorMessage } from '../components/markup/ASTErrorMessage'
import Plotly from '../components/Plotly'
import rstConvert from './rst'

