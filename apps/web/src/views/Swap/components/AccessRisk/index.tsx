import { useTranslation } from '@pancakeswap/localization'
import { ERC20Token, Token } from '@pancakeswap/sdk'
import { Button, Dots, Flex, HelpIcon, IconButton, Link, RefreshIcon, Tag, Text, useTooltip } from '@pancakeswap/uikit'
import { useState } from 'react'
import { useUserTokenRisk } from 'state/user/hooks/useUserTokenRisk'
import useSWRImmutable from 'swr/immutable'
import { fetchRiskToken } from 'views/Swap/hooks/fetchTokenRisk'

interface AccessRiskProps {
  token: ERC20Token
}

function RetryRisk({ onClick }: { onClick: () => void }) {
  const [retry, setRetry] = useState(false)
  const { t } = useTranslation()
  const retryTooltip = useTooltip(
    <>
      {t('Risk scanning failed.')} {!retry && t('Press the button to retry.')}
    </>,
  )
  return (
    <div ref={retryTooltip.targetRef}>
      <IconButton
        ml="4px"
        onClick={() => {
          setRetry(true)
          onClick()
        }}
        disabled={retry}
        variant="text"
        size="sm"
        style={{ width: '20px' }}
        height="20px"
      >
        <RefreshIcon color="primary" width="16px" height="16px" />
      </IconButton>
      {retryTooltip.tooltipVisible && retryTooltip.tooltip}
    </div>
  )
}

export function useTokenRisk(token?: Token) {
  return useSWRImmutable(token && ['risk', token.chainId, token.address], () => {
    return fetchRiskToken(token.address, token.chainId)
  })
}

const AccessRisk: React.FC<AccessRiskProps> = ({ token }) => {
  const [show] = useUserTokenRisk()

  return show && <AccessRiskComponent token={token} />
}

const AccessRiskComponent: React.FC<AccessRiskProps> = ({ token }) => {
  const { t } = useTranslation()

  const { data, mutate, error } = useTokenRisk(token)

  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    <>
      <Text as="span">{t('Risk scan results are provided by a third party')}</Text>
      <Link style={{ display: 'inline' }} ml="4px" external href="https://www.avengerdao.org">
        AvengerDAO
      </Link>
      <Text my="8px">
        {t(
          'It is a tool for indicative purposes only to allow users to check the reference risk level of a BNB Chain Smart Contract. Please do your own research - interactions with any BNB Chain Smart Contract is at your own risk.',
        )}
      </Text>
      <Flex mt="4px">
        <Text>{t('Learn more about risk rating')}</Text>
        <Link ml="4px" external href="https://www.avengerdao.org/docs/meter/consumer-api/RiskBand">
          {t('here.')}
        </Link>
      </Flex>
    </>,
    { placement: 'bottom' },
  )

  if (data) {
    return (
      <Flex justifyContent="flex-end">
        <div ref={targetRef} style={{ userSelect: 'none' }}>
          <Tag>
            <strong>{t('%riskLevel% Risk', { riskLevel: data.riskLevel })}</strong>
            {tooltipVisible && tooltip}
            <Flex>
              <HelpIcon ml="4px" width="16px" height="16px" color="#fff" />
            </Flex>
          </Tag>
        </div>
      </Flex>
    )
  }

  if (error) {
    return (
      <Flex justifyContent="flex-end" alignItems="center">
        <div ref={targetRef} style={{ userSelect: 'none' }}>
          <Tag variant="textDisabled">
            <strong>{t('Unknown')}</strong>
            {tooltipVisible && tooltip}
            <Flex>
              <HelpIcon ml="4px" width="16px" height="16px" color="#fff" />
            </Flex>
          </Tag>
        </div>
        <RetryRisk
          onClick={() => mutate()}
          // key for resetting retry state
          key={token.chainId + token.address}
        />
      </Flex>
    )
  }

  return (
    <>
      <Flex justifyContent="flex-end">
        <Button variant="bubblegum" scale="xs" style={{ textTransform: 'uppercase' }} disabled>
          <Dots>{t('Scanning Risk')}</Dots>
        </Button>
        {tooltipVisible && tooltip}
        <Flex ref={targetRef}>
          <HelpIcon ml="4px" width="20px" height="20px" color="textSubtle" />
        </Flex>
      </Flex>
    </>
  )
}

export default AccessRisk
