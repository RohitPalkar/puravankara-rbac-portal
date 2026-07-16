import { useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z as zod } from 'zod';
import { CONFIG } from 'src/config-global';
import { Form, Field } from 'src/components/hook-form';
import { PageContainer, PageHeader } from 'src/components/page-layout';
import { Iconify } from 'src/components/iconify';
import { RichTextEditor } from 'src/components/rich-text-editor';
import { FormSection } from 'src/components/form-section';
import { Breadcrumb } from 'src/components/breadcrumb';
import { mockBrands, mockCities, mockProjects } from 'src/services/mock-data';
import { paths } from 'src/routes/paths';
import type { Project, ProjectPaymentGateway, ProjectIncentiveRule } from 'src/types';

interface GatewayForm {
  gatewayType: 'razorpay' | 'easebuzz_booking' | 'easebuzz_milestone';
  merchantId: string;
  secretKey: string;
  salt: string;
  key: string;
  subMerchantId: string;
}

interface IncentiveForm {
  incentiveType: 'rera' | 'rtm';
  regularizationPercentage: string;
  payablePercentage: string;
  maxDays: string;
  startDate: string;
}

interface FormValues {
  name: string;
  brandId: string;
  cityId: string;
  billingName: string;
  panNumber: string;
  gstin: string;
  address1: string;
  address2: string;
  pinCode: string;
  projectImage: string;
  jvLogo: string;
  sfdcProjectName: string;
  codename: string;
  termsHtml: string;
}

const formSchema = zod.object({
  name: zod.string().min(1, 'Project name is required'),
  brandId: zod.string().min(1, 'Brand is required'),
  cityId: zod.string().min(1, 'City is required'),
  billingName: zod.string().optional(),
  panNumber: zod.string().optional(),
  gstin: zod.string().optional(),
  address1: zod.string().optional(),
  address2: zod.string().optional(),
  pinCode: zod.string().optional(),
  projectImage: zod.string().optional(),
  jvLogo: zod.string().optional(),
  sfdcProjectName: zod.string().optional(),
  codename: zod.string().optional(),
  termsHtml: zod.string().optional(),
});

export default function ProjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const existing = useMemo(
    () => (isEdit ? mockProjects.find((p) => p.id === id) : null),
    [id, isEdit],
  );

  const defaults: FormValues = {
    name: existing?.name ?? '',
    brandId: existing?.brandId ?? '',
    cityId: existing?.cityId ?? '',
    billingName: existing?.billingName ?? '',
    panNumber: existing?.panNumber ?? '',
    gstin: existing?.gstin ?? '',
    address1: existing?.address1 ?? '',
    address2: existing?.address2 ?? '',
    pinCode: existing?.pinCode ?? '',
    projectImage: existing?.projectImage ?? '',
    jvLogo: existing?.jvLogo ?? '',
    sfdcProjectName: existing?.sfdcProjectName ?? '',
    codename: existing?.codename ?? '',
    termsHtml: existing?.termsHtml ?? '',
  };

  const methods = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: defaults });

  const selectedBrandId = methods.watch('brandId');

  const filteredCities = useMemo(
    () => mockCities.filter((c) => !selectedBrandId || c.zoneId === selectedBrandId),
    [selectedBrandId],
  );

  const [gateways, setGateways] = useState<GatewayForm[]>(() => {
    if (!existing?.paymentGateways?.length) return [];
    return existing.paymentGateways.map((g) => ({
      gatewayType: g.gatewayType,
      merchantId: g.merchantId ?? '',
      secretKey: g.secretKey ?? '',
      salt: g.salt ?? '',
      key: g.key ?? '',
      subMerchantId: g.subMerchantId ?? '',
    }));
  });

  const [incentives, setIncentives] = useState<IncentiveForm[]>(() => {
    if (!existing?.incentiveRules?.length) return [];
    return existing.incentiveRules.map((r) => ({
      incentiveType: r.incentiveType,
      regularizationPercentage: r.regularizationPercentage?.toString() ?? '',
      payablePercentage: r.payablePercentage?.toString() ?? '',
      maxDays: r.maxDays?.toString() ?? '',
      startDate: r.startDate ?? '',
    }));
  });

  const [expanded, setExpanded] = useState<string | false>('panel1');

  const handleAccordion = (panel: string) => (_: any, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const addGateway = useCallback((type: GatewayForm['gatewayType']) => {
    setGateways((prev) => {
      if (prev.some((g) => g.gatewayType === type)) return prev;
      return [...prev, { gatewayType: type, merchantId: '', secretKey: '', salt: '', key: '', subMerchantId: '' }];
    });
  }, []);

  const removeGateway = useCallback((type: GatewayForm['gatewayType']) => {
    setGateways((prev) => prev.filter((g) => g.gatewayType !== type));
  }, []);

  const updateGateway = useCallback((type: GatewayForm['gatewayType'], field: keyof GatewayForm, value: string) => {
    setGateways((prev) => prev.map((g) => g.gatewayType === type ? { ...g, [field]: value } : g));
  }, []);

  const addIncentive = useCallback((type: IncentiveForm['incentiveType']) => {
    setIncentives((prev) => {
      if (prev.some((r) => r.incentiveType === type)) return prev;
      return [...prev, { incentiveType: type, regularizationPercentage: '', payablePercentage: '', maxDays: '', startDate: '' }];
    });
  }, []);

  const removeIncentive = useCallback((type: IncentiveForm['incentiveType']) => {
    setIncentives((prev) => prev.filter((r) => r.incentiveType !== type));
  }, []);

  const updateIncentive = useCallback((type: IncentiveForm['incentiveType'], field: keyof IncentiveForm, value: string) => {
    setIncentives((prev) => prev.map((r) => r.incentiveType === type ? { ...r, [field]: value } : r));
  }, []);

  const onSubmit = useCallback((form: FormValues) => {
    navigate(paths.dashboard.projectMaster);
  }, [navigate]);

  const breadcrumbs = [
    { label: 'Project Master', href: paths.dashboard.projectMaster },
    { label: isEdit ? 'Edit Project' : 'Create Project' },
  ];

  return (
    <>
      <Helmet><title>{isEdit ? 'Edit' : 'Create'} Project - {CONFIG.appName}</title></Helmet>
      <PageContainer>
        <PageHeader title={isEdit ? 'Edit Project' : 'Create Project'} description="Configure project details, branding, payment gateways, and incentive criteria" />
        <Breadcrumb items={breadcrumbs} />

        <Form methods={methods} onSubmit={methods.handleSubmit(onSubmit)}>
          <Accordion expanded={expanded === 'panel1'} onChange={handleAccordion('panel1')}>
            <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" />}>
              <Typography variant="subtitle1">Project Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
                <Field.Select name="brandId" label="Brand *" options={mockBrands.map((b) => ({ value: b.id, label: b.brandName }))} />
                <Field.Select name="cityId" label="City *" options={filteredCities.map((c) => ({ value: c.id, label: c.name }))} />
                <Field.Text name="name" label="Project Name *" placeholder="Enter project name" />
                <Field.Text name="billingName" label="Billing Name" placeholder="Legal billing entity name" />
                <Field.Text name="panNumber" label="PAN Number" placeholder="e.g. AAAAA1234A" />
                <Field.Text name="gstin" label="GSTIN" placeholder="e.g. 27AAACP1234C1ZW" />
                <Field.Text name="address1" label="Address Line 1" />
                <Field.Text name="address2" label="Address Line 2" />
                <Field.Text name="pinCode" label="PIN Code" placeholder="6 digits" />
                <Field.Text name="sfdcProjectName" label="SFDC Project Name" placeholder="Salesforce project name" />
                <Field.Text name="codename" label="Project Codename" placeholder="Internal identifier" />
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'panel2'} onChange={handleAccordion('panel2')}>
            <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" />}>
              <Typography variant="subtitle1">Branding</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2.5}>
                <Field.Text name="projectImage" label="Project Image URL" placeholder="https://example.com/image.jpg" />
                <Field.Text name="jvLogo" label="JV Partner Logo URL" placeholder="https://example.com/logo.jpg" />
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'panel3'} onChange={handleAccordion('panel3')}>
            <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" />}>
              <Typography variant="subtitle1">Payment Gateway Configuration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {(['razorpay', 'easebuzz_booking', 'easebuzz_milestone'] as const).map((type) => {
                    const enabled = gateways.some((g) => g.gatewayType === type);
                    const labels = { razorpay: 'Razorpay', easebuzz_booking: 'Easebuzz (Booking)', easebuzz_milestone: 'Easebuzz (Milestone)' };
                    return (
                      <Button
                        key={type}
                        size="small"
                        variant={enabled ? 'contained' : 'outlined'}
                        color={enabled ? 'primary' : 'inherit'}
                        onClick={() => enabled ? removeGateway(type) : addGateway(type)}
                        startIcon={<Iconify icon={enabled ? 'solar:check-circle-bold' : 'solar:add-circle-bold'} />}
                      >
                        {labels[type]}
                      </Button>
                    );
                  })}
                </Stack>
                {gateways.map((gw) => (
                  <Card key={gw.gatewayType} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2">{gw.gatewayType === 'razorpay' ? 'Razorpay' : gw.gatewayType === 'easebuzz_booking' ? 'Easebuzz Booking' : 'Easebuzz Milestone'}</Typography>
                      <IconButton size="small" onClick={() => removeGateway(gw.gatewayType)} color="error">
                        <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                      </IconButton>
                    </Stack>
                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                      <TextField size="small" label="Merchant ID" value={gw.merchantId} onChange={(e) => updateGateway(gw.gatewayType, 'merchantId', e.target.value)} />
                      <TextField size="small" label="Secret Key" type="password" value={gw.secretKey} onChange={(e) => updateGateway(gw.gatewayType, 'secretKey', e.target.value)} />
                      {gw.gatewayType !== 'razorpay' && (
                        <>
                          <TextField size="small" label="Salt" value={gw.salt} onChange={(e) => updateGateway(gw.gatewayType, 'salt', e.target.value)} />
                          <TextField size="small" label="Key" value={gw.key} onChange={(e) => updateGateway(gw.gatewayType, 'key', e.target.value)} />
                          <TextField size="small" label="Sub Merchant ID" value={gw.subMerchantId} onChange={(e) => updateGateway(gw.gatewayType, 'subMerchantId', e.target.value)} />
                        </>
                      )}
                    </Box>
                  </Card>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'panel4'} onChange={handleAccordion('panel4')}>
            <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" />}>
              <Typography variant="subtitle1">Incentive Criteria</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1}>
                  {(['rera', 'rtm'] as const).map((type) => {
                    const enabled = incentives.some((r) => r.incentiveType === type);
                    const labels = { rera: 'RERA / Under Construction', rtm: 'RTM / OC Received' };
                    return (
                      <Button
                        key={type}
                        size="small"
                        variant={enabled ? 'contained' : 'outlined'}
                        color={enabled ? 'primary' : 'inherit'}
                        onClick={() => enabled ? removeIncentive(type) : addIncentive(type)}
                        startIcon={<Iconify icon={enabled ? 'solar:check-circle-bold' : 'solar:add-circle-bold'} />}
                      >
                        {labels[type]}
                      </Button>
                    );
                  })}
                </Stack>
                {incentives.map((rule) => (
                  <Card key={rule.incentiveType} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2">{rule.incentiveType === 'rera' ? 'RERA / Under Construction' : 'RTM / OC Received'}</Typography>
                      <IconButton size="small" onClick={() => removeIncentive(rule.incentiveType)} color="error">
                        <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                      </IconButton>
                    </Stack>
                    <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2}>
                      <TextField size="small" label="Regularization %" type="number" value={rule.regularizationPercentage} onChange={(e) => updateIncentive(rule.incentiveType, 'regularizationPercentage', e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
                      <TextField size="small" label="Payable %" type="number" value={rule.payablePercentage} onChange={(e) => updateIncentive(rule.incentiveType, 'payablePercentage', e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
                      <TextField size="small" label="Max Days" type="number" value={rule.maxDays} onChange={(e) => updateIncentive(rule.incentiveType, 'maxDays', e.target.value)} />
                      {rule.incentiveType === 'rtm' && (
                        <TextField size="small" label="Start Date" placeholder="YYYY-MM-DD" value={rule.startDate} onChange={(e) => updateIncentive(rule.incentiveType, 'startDate', e.target.value)} />
                      )}
                    </Box>
                  </Card>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={expanded === 'panel5'} onChange={handleAccordion('panel5')}>
            <AccordionSummary expandIcon={<Iconify icon="solar:alt-arrow-down-bold" />}>
              <Typography variant="subtitle1">Terms & Conditions</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <RichTextEditor
                value={methods.watch('termsHtml') ?? ''}
                onChange={(val: string) => methods.setValue('termsHtml', val)}
              />
            </AccordionDetails>
          </Accordion>

          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button color="inherit" onClick={() => navigate(paths.dashboard.projectMaster)}>Cancel</Button>
            <Button type="submit" variant="contained">{isEdit ? 'Update Project' : 'Create Project'}</Button>
          </Stack>
        </Form>
      </PageContainer>
    </>
  );
}
