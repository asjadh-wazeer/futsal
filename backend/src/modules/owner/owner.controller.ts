import { Controller, Get, Post, Patch, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OwnerService } from './owner.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Owner')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('owner')
export class OwnerController {
  constructor(private service: OwnerService) {}

  @Get('dashboard')
  getDashboard(@Request() req, @Query('branchId') branchId?: string) {
    const effectiveBranchId = req.user.role === 'STAFF' ? req.user.branchId : (branchId || undefined);
    return this.service.getDashboard(req.user.businessId, effectiveBranchId);
  }

  @Get('analytics')
  getAnalytics(
    @Request() req,
    @Query('period') period: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('branchId') branchId?: string,
  ) {
    const effectiveBranchId = req.user.role === 'STAFF' ? req.user.branchId : (branchId || undefined);
    return this.service.getAnalytics(req.user.businessId, { period, from, to, branchId: effectiveBranchId });
  }

  @Get('courts')
  getCourts(@Request() req) {
    const branchId = req.user.role === 'STAFF' ? req.user.branchId : undefined;
    return this.service.getCourts(req.user.businessId, branchId);
  }

  @Post('courts')
  createCourt(@Request() req, @Body() body: any) {
    return this.service.createCourt(req.user.businessId, body);
  }

  @Get('courts/:id')
  getCourt(@Request() req, @Param('id') id: string) {
    return this.service.getCourt(id, req.user.businessId);
  }

  @Patch('courts/:id')
  updateCourt(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.service.updateCourt(id, req.user.businessId, body);
  }

  @Get('courts/:id/pricing')
  getPricingRules(@Request() req, @Param('id') id: string) {
    return this.service.getPricingRules(id, req.user.businessId);
  }

  @Post('courts/:id/pricing')
  createPricingRule(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.service.createPricingRule(id, req.user.businessId, body);
  }

  @Patch('courts/:courtId/pricing/:ruleId')
  updatePricingRule(
    @Request() req,
    @Param('ruleId') ruleId: string,
    @Body() body: any,
  ) {
    return this.service.updatePricingRule(ruleId, req.user.businessId, body);
  }

  @Delete('courts/:courtId/pricing/:ruleId')
  deletePricingRule(@Request() req, @Param('ruleId') ruleId: string) {
    return this.service.deletePricingRule(ruleId, req.user.businessId);
  }

  @Get('courts/:id/schedule')
  getSchedule(@Request() req, @Param('id') id: string) {
    return this.service.getSchedule(id, req.user.businessId);
  }

  @Put('courts/:id/schedule')
  upsertSchedule(@Request() req, @Param('id') id: string, @Body() body: { schedules: any[] }) {
    return this.service.upsertSchedule(id, req.user.businessId, body.schedules);
  }

  @Get('bookings')
  getBookings(
    @Request() req,
    @Query('status') status: string,
    @Query('date') date: string,
    @Query('search') search: string,
    @Query('courtId') courtId: string,
    @Query('branchId') branchId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const effectiveBranchId = req.user.role === 'STAFF' ? req.user.branchId : (branchId || undefined);
    return this.service.getBookings(req.user.businessId, {
      status, date, search, courtId,
      branchId: effectiveBranchId,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('courts/:id/availability')
  getCourtAvailability(@Request() req, @Param('id') id: string, @Query('date') date: string) {
    return this.service.getCourtAvailability(id, date, req.user.businessId);
  }

  @Post('bookings/manual')
  createManualBooking(@Request() req, @Body() body: any) {
    return this.service.createManualBooking(
      { businessId: req.user.businessId, role: req.user.role, branchId: req.user.branchId, name: req.user.name },
      body,
    );
  }

  @Patch('bookings/:id/status')
  updateBookingStatus(@Request() req, @Param('id') id: string, @Body() body: { status: string }) {
    const cancelledByName = body.status === 'CANCELLED'
      ? `${req.user.name} (${req.user.role})`
      : undefined;
    return this.service.updateBookingStatus(id, req.user.businessId, body.status, cancelledByName);
  }

  @Get('branches')
  getBranches(@Request() req) {
    return this.service.getBranches(req.user.businessId);
  }

  @Post('branches')
  createBranch(@Request() req, @Body() body: any) {
    return this.service.createBranch(req.user.businessId, body);
  }

  @Patch('branches/:id')
  updateBranch(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.service.updateBranch(id, req.user.businessId, body);
  }

  @Delete('branches/:id')
  deleteBranch(@Request() req, @Param('id') id: string) {
    return this.service.deleteBranch(id, req.user.businessId);
  }

  @Get('sports')
  getSports() {
    return this.service.getSports();
  }

  // ── Staff Management (Owner creates/manages employees) ────────────

  @Get('staff')
  getStaff(@Request() req, @Query('branchId') branchId?: string) {
    return this.service.getStaff(req.user.businessId, branchId || undefined);
  }

  @Post('staff')
  createStaff(@Request() req, @Body() body: any) {
    return this.service.createStaff(req.user.businessId, body);
  }

  @Patch('staff/:id')
  updateStaff(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.service.updateStaff(id, req.user.businessId, body);
  }

  @Post('staff/:id/reset-password')
  resetStaffPassword(@Request() req, @Param('id') id: string, @Body() body: { newPassword: string }) {
    return this.service.resetStaffPassword(id, req.user.businessId, body.newPassword);
  }

  // ── Owner account management (accessible by SUPER_ADMIN) ─────────

  @Post('manage/owners')
  createOwner(@Body() body: any) {
    return this.service.createOwner(body);
  }

  @Get('manage/owners')
  getOwners() {
    return this.service.getOwners();
  }

  @Patch('manage/owners/:id/toggle')
  toggleOwnerStatus(@Param('id') id: string) {
    return this.service.toggleOwnerStatus(id);
  }

  @Patch('manage/owners/:id')
  updateOwner(@Param('id') id: string, @Body() body: any) {
    return this.service.updateOwner(id, body);
  }

  @Delete('manage/owners/:id')
  deleteOwner(@Param('id') id: string) {
    return this.service.deleteOwner(id);
  }

  @Get('manage/businesses')
  getBusinesses() {
    return this.service.getBusinesses();
  }
}
