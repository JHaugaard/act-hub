import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { formatDateOnly, formatTimestamp } from '@/utils/dateUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Trash2, ExternalLink, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePIs, useSponsors, useFileDetail } from '@/hooks/useData';
import { FileAttachmentsManager } from '@/components/FileAttachmentsManager';
import { RelatedProposalsPopover } from '@/components/RelatedProposalsPopover';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Done':
      return 'default';
    case 'In':
    case 'Process':
      return 'secondary';
    case 'Pending':
    case 'Pending Signatures':
      return 'outline';
    case 'On Hold':
    case 'Withdrawn':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function FileDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Use the unified file detail hook
  const {
    file,
    loading,
    error,
    updatePI,
    updateSponsor,
    updateStatus,
    updateDBNo,
    updateNotes,
    updateCayuse,
    updateDateReceived,
    updateStatusDate,
    deleteFile,
  } = useFileDetail(id);

  // Individual field states for inline editing
  const [editingPI, setEditingPI] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState(false);
  const [editingDateReceived, setEditingDateReceived] = useState(false);
  const [editingStatusDate, setEditingStatusDate] = useState(false);
  const [editingDBNo, setEditingDBNo] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [editingCayuse, setEditingCayuse] = useState(false);

  // Loading states for individual fields
  const [savingPI, setSavingPI] = useState(false);
  const [savingSponsor, setSavingSponsor] = useState(false);
  const [savingDateReceived, setSavingDateReceived] = useState(false);
  const [savingStatusDate, setSavingStatusDate] = useState(false);
  const [savingDBNo, setSavingDBNo] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [savingCayuse, setSavingCayuse] = useState(false);

  // Temporary values for editing
  const [tempDBNo, setTempDBNo] = useState('');
  const [tempNotes, setTempNotes] = useState('');
  const [tempCayuse, setTempCayuse] = useState('');

  // Get PI and Sponsor data for autocomplete
  const { pis, createPI } = usePIs();
  const { sponsors, createSponsor } = useSponsors();

  // Note: We don't auto-navigate on error - let the user see the error message
  // The "File not found" UI below handles the case when file is null

  const handleDelete = async () => {
    const success = await deleteFile();
    if (success) {
      navigate('/proposals');
    }
  };

  // Individual field save functions
  const handlePIChange = async (piId: string) => {
    if (!file || savingPI) return;
    setSavingPI(true);
    const success = await updatePI(piId);
    if (success) setEditingPI(false);
    setSavingPI(false);
  };

  const handleSponsorChange = async (sponsorId: string) => {
    if (!file || savingSponsor) return;
    setSavingSponsor(true);
    const success = await updateSponsor(sponsorId);
    if (success) setEditingSponsor(false);
    setSavingSponsor(false);
  };

  const handleDateReceivedChange = async (date: Date | undefined) => {
    if (!file || savingDateReceived) return;
    setSavingDateReceived(true);
    const success = await updateDateReceived(date);
    if (success) setEditingDateReceived(false);
    setSavingDateReceived(false);
  };

  const handleStatusDateChange = async (date: Date | undefined) => {
    if (!file || savingStatusDate) return;
    setSavingStatusDate(true);
    const success = await updateStatusDate(date);
    if (success) setEditingStatusDate(false);
    setSavingStatusDate(false);
  };

  const handleDBNoChange = async () => {
    if (!file || savingDBNo || !tempDBNo.trim()) return;
    setSavingDBNo(true);
    const success = await updateDBNo(tempDBNo.trim());
    if (success) setEditingDBNo(false);
    setSavingDBNo(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!file || savingStatus) return;
    setSavingStatus(true);
    await updateStatus(newStatus);
    setSavingStatus(false);
  };

  const handleNotesChange = async () => {
    if (!file || savingNotes) return;
    setSavingNotes(true);
    const success = await updateNotes(tempNotes.trim());
    if (success) setEditingNotes(false);
    setSavingNotes(false);
  };

  const handleCayuseChange = async () => {
    if (!file || savingCayuse) return;
    setSavingCayuse(true);
    const success = await updateCayuse(tempCayuse.trim());
    if (success) setEditingCayuse(false);
    setSavingCayuse(false);
  };

  const statusOptions = ['In', 'Process', 'Pending', 'Pending Signature', 'Pending Signatures', 'Done', 'On Hold', 'Withdrawn'];

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {error ? `Error: ${error.message}` : 'File not found.'}
          </p>
          <Button onClick={() => navigate('/proposals')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Proposals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/proposals')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Proposals
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {file.db_no}
            </h1>
            <p className="text-muted-foreground">
              {file.pi_name} • {file.sponsor_name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this proposal? This action cannot be undone and will also delete all associated file attachments.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Proposal
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
          {/* Main Information */}
          <Card>
            <CardHeader>
              <CardTitle>Proposal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">DB No.</label>
                    {!editingDBNo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          setTempDBNo(file.db_no);
                          setEditingDBNo(true);
                        }}
                        disabled={savingDBNo}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  <div className="mt-1">
                    {editingDBNo ? (
                      <div className="flex gap-2">
                        <Input
                          value={tempDBNo}
                          onChange={(e) => setTempDBNo(e.target.value)}
                          placeholder="Enter DB No."
                          disabled={savingDBNo}
                        />
                        <Button
                          size="sm"
                          onClick={handleDBNoChange}
                          disabled={savingDBNo || !tempDBNo.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingDBNo(false);
                            setTempDBNo(file.db_no);
                          }}
                          disabled={savingDBNo}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <p className="font-medium">{file.db_no}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Select
                      value={file.status}
                      onValueChange={(value) => handleStatusChange(value)}
                      disabled={savingStatus}
                    >
                      <SelectTrigger className="w-auto h-auto p-0 border-0 shadow-none justify-start">
                        <Badge variant={getStatusColor(file.status)} className="justify-start text-left">
                          {savingStatus ? 'Saving...' : file.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">PI</label>
                    {!editingPI && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setEditingPI(true)}
                        disabled={savingPI}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  <div className="mt-1">
                    {editingPI ? (
                      <AutocompleteInput
                        items={pis}
                        value={file.pi_id}
                        onSelect={handlePIChange}
                        onCreate={async (name) => {
                          const newPI = await createPI(name);
                          if (newPI) {
                            handlePIChange(newPI.id);
                          }
                        }}
                        placeholder="Select or create PI"
                        createLabel="Create new PI"
                        disabled={savingPI}
                      />
                    ) : (
                      <RelatedProposalsPopover
                        entityId={file.pi_id}
                        entityName={file.pi_name}
                        entityType="pi"
                      >
                        <button className="font-medium text-primary hover:underline text-left">
                          {file.pi_name}
                        </button>
                      </RelatedProposalsPopover>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">Sponsor</label>
                    {!editingSponsor && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setEditingSponsor(true)}
                        disabled={savingSponsor}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  <div className="mt-1">
                    {editingSponsor ? (
                      <AutocompleteInput
                        items={sponsors}
                        value={file.sponsor_id}
                        onSelect={handleSponsorChange}
                        onCreate={async (name) => {
                          const newSponsor = await createSponsor(name);
                          if (newSponsor) {
                            handleSponsorChange(newSponsor.id);
                          }
                        }}
                        placeholder="Select or create sponsor"
                        createLabel="Create new sponsor"
                        disabled={savingSponsor}
                      />
                    ) : (
                      <RelatedProposalsPopover
                        entityId={file.sponsor_id}
                        entityName={file.sponsor_name}
                        entityType="sponsor"
                      >
                        <button className="font-medium text-primary hover:underline text-left">
                          {file.sponsor_name}
                        </button>
                      </RelatedProposalsPopover>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Cayuse</label>
                  {!editingCayuse && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => {
                        setTempCayuse(file.cayuse || '');
                        setEditingCayuse(true);
                      }}
                      disabled={savingCayuse}
                    >
                      Edit
                    </Button>
                  )}
                </div>
                <div className="mt-1">
                  {editingCayuse ? (
                    <div className="flex gap-2">
                      <Input
                        value={tempCayuse}
                        onChange={(e) => setTempCayuse(e.target.value)}
                        placeholder="Enter Cayuse ID"
                        disabled={savingCayuse}
                      />
                      <Button
                        size="sm"
                        onClick={handleCayuseChange}
                        disabled={savingCayuse}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingCayuse(false);
                          setTempCayuse(file.cayuse || '');
                        }}
                        disabled={savingCayuse}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <p className="font-medium">{file.cayuse || '-'}</p>
                  )}
                </div>
              </div>

              {file.external_link && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">External Link</label>
                  <a
                    href={file.external_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {file.external_link}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  {!editingNotes && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => {
                        setTempNotes(file.notes || '');
                        setEditingNotes(true);
                      }}
                      disabled={savingNotes}
                    >
                      Edit
                    </Button>
                  )}
                </div>
                <div className="mt-1">
                  {editingNotes ? (
                    <div className="space-y-2">
                      <Textarea
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="Enter notes"
                        rows={4}
                        disabled={savingNotes}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleNotesChange}
                          disabled={savingNotes}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingNotes(false);
                            setTempNotes(file.notes || '');
                          }}
                          disabled={savingNotes}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {file.notes || 'No notes added'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Important Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Date Received</label>
                  {!editingDateReceived && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setEditingDateReceived(true)}
                      disabled={savingDateReceived}
                    >
                      Edit
                    </Button>
                  )}
                </div>
                <div className="mt-1">
                  {editingDateReceived ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !file.date_received && "text-muted-foreground"
                          )}
                          disabled={savingDateReceived}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {file.date_received ? format(new Date(file.date_received), "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={file.date_received ? new Date(file.date_received) : undefined}
                          onSelect={handleDateReceivedChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <p className="font-medium">
                      {formatDateOnly(file.date_received) || 'Not set'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Status Last Changed</label>
                  {!editingStatusDate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setEditingStatusDate(true)}
                      disabled={savingStatusDate}
                    >
                      Edit
                    </Button>
                  )}
                </div>
                <div className="mt-1">
                  {editingStatusDate ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !file.date_status_change && "text-muted-foreground"
                          )}
                          disabled={savingStatusDate}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {file.date_status_change
                            ? format(new Date(file.date_status_change), "PPP")
                            : "Pick a date"
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={file.date_status_change ? new Date(file.date_status_change) : undefined}
                          onSelect={handleStatusDateChange}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <p className="font-medium">
                      {formatDateOnly(file.date_status_change) || 'Not set'}
                    </p>
                  )}
                </div>
              </div>

              {file.to_set_up && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">To Set Up</label>
                  <p className="font-medium">
                    {formatDateOnly(file.to_set_up)}
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm text-muted-foreground">
                  {formatTimestamp(file.created_at)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm text-muted-foreground">
                  {formatTimestamp(file.updated_at)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* File Attachments */}
      <FileAttachmentsManager fileId={file.id} />
    </div>
  );
}