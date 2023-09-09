import styled from '@emotion/styled'

import { Picker } from '../../components/Picker'
import { theme } from '../../utils/theme'
import { HomeLink } from './HomeLink'

const mirroredOn = new Date('2023-09-09')
const isMobile = window.matchMedia(theme.mediaQueries.js.mobile).matches

type Props = {
  className?: string
}

export const AvailabilityPicker = ({ className }: Props): JSX.Element => (
  <Picker
    labelPrefix="availability"
    labelValue={null}
    valueIsSelected={false}
    className={className}
    contentStyle={isMobile ? { left: 0, right: 'unset' } : undefined}
  >
    <Container>
      <Links>
        <HomeLink to={{ available: 'yes' }}>available</HomeLink>
        <HomeLink to={{ available: 'no' }}>no longer available</HomeLink>
        <HomeLink to={{ available: 'both' }}>both</HomeLink>
      </Links>
      <Detail>
        Some images are no longer available on Imgur. I mirrored them on my server the{' '}
        {mirroredOn.toLocaleDateString()}, but it was already to late for some of them.
      </Detail>
    </Container>
  </Picker>
)

const Container = styled.div({
  maxWidth: '100vw',
  width: 'calc(350px + 2.67em)',
  padding: `${theme.Header.link.padding.top} 1.33em`,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.s,
})

const Links = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: theme.spacing.xs,
})

const Detail = styled.p({
  textAlign: 'justify',
})
